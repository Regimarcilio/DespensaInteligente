package br.com.despensa.presentation.lista

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.despensa.data.local.dao.BaixaDao
import br.com.despensa.data.local.dao.EstoqueDao
import br.com.despensa.domain.ItemReposicao
import br.com.despensa.domain.diasParaVencer
import br.com.despensa.domain.formatarReais
import br.com.despensa.domain.gerarTexto
import br.com.despensa.presentation.theme.Ambar
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.Tinta
import br.com.despensa.presentation.theme.UvaNoite
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Origem da sugestão (US06): o que você consumiu + o que vence em 7 dias. */
enum class OrigemSugestao { CONSUMO, VALIDADE }

data class Sugestao(
    val nome: String,
    val quantidade: Double,
    val unidade: String,
    val precoUnit: Double?,
    val origem: OrigemSugestao,
    val marcada: Boolean = false
)

/**
 * Estado da lista de compra em MEMÓRIA (não persistida): a lista é descartável —
 * nasce das sugestões, vira texto e é exportada p/ o ListaCompras. Evita nova
 * tabela/migração; se S4 pedir persistência, o backup JSON cobre.
 */
@HiltViewModel
class ListaViewModel @Inject constructor(
    private val baixaDao: BaixaDao,
    private val estoqueDao: EstoqueDao
) : ViewModel() {
    private val _sugestoes = MutableStateFlow<List<Sugestao>>(emptyList())
    val sugestoes: StateFlow<List<Sugestao>> = _sugestoes.asStateFlow()

    private val _texto = MutableStateFlow("")
    val texto: StateFlow<String> = _texto.asStateFlow()

    init {
        recarregar()
    }

    fun recarregar() = viewModelScope.launch {
        val agora = System.currentTimeMillis()
        val ha30d = agora - 30L * 24 * 60 * 60 * 1000
        val recentes = runCatching { baixaDao.consumidosRecentes(ha30d) }.getOrDefault(emptyList())
        // Defensivo contra empates de ts (ver BaixaDao.consumidosRecentes).
        val porConsumo = recentes.distinctBy { it.nome.trim().lowercase() }
            .filter { it.nome.isNotBlank() }
            .map {
                Sugestao(
                    nome = it.nome,
                    quantidade = it.quantidade,
                    unidade = it.unidade,
                    precoUnit = if (it.quantidade > 0) it.valorTotal / it.quantidade else null,
                    origem = OrigemSugestao.CONSUMO
                )
            }
        val nomes = porConsumo.map { it.nome.trim().lowercase() }.toSet()
        val estoque = runCatching { estoqueDao.listarTudo() }.getOrDefault(emptyList())
        val vencendo = estoque
            .filter { item ->
                val dias = diasParaVencer(item.validade, agora)
                dias != null && dias in 0..7 && item.nome.trim().lowercase() !in nomes
            }
            .map {
                Sugestao(
                    nome = it.nome,
                    quantidade = it.quantidade,
                    unidade = it.unidade,
                    precoUnit = it.precoRef,
                    origem = OrigemSugestao.VALIDADE
                )
            }
        // Preserva marcação/qtd de quem já estava na tela ao recarregar.
        val anteriores = _sugestoes.value.associateBy { it.nome.trim().lowercase() }
        _sugestoes.value = (porConsumo + vencendo).map { nova ->
            val chave = nova.nome.trim().lowercase()
            anteriores[chave]?.copy(
                quantidade = anteriores[chave]!!.quantidade,
                marcada = anteriores[chave]!!.marcada
            ) ?: nova
        }
    }

    fun alternar(nome: String) {
        _sugestoes.value = _sugestoes.value.map {
            if (it.nome == nome) it.copy(marcada = !it.marcada) else it
        }
    }

    fun ajustarQtd(nome: String, delta: Double) {
        _sugestoes.value = _sugestoes.value.map {
            if (it.nome == nome) it.copy(quantidade = (it.quantidade + delta).coerceAtLeast(0.5)) else it
        }
    }

    val selecionadas: List<Sugestao> get() = _sugestoes.value.filter { it.marcada }

    /** Monta EXATAMENTE o formato que o ListaCompras v2.0 importa. */
    fun gerarTextoReposicao() {
        _texto.value = gerarTexto(
            "Reposição Despensa",
            selecionadas.map {
                ItemReposicao(it.nome, it.quantidade, it.unidade, it.precoUnit)
            }
        )
    }
}

private fun formatarQtd(qtd: Double): String =
    if (qtd % 1.0 == 0.0) qtd.toInt().toString() else qtd.toString()

@Composable
fun ListaScreen(vm: ListaViewModel = hiltViewModel()) {
    val sugestoes by vm.sugestoes.collectAsState()
    val texto by vm.texto.collectAsState()
    val contexto = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val escopo = rememberCoroutineScope()
    val selecionadas = sugestoes.count { it.marcada }

    Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { pad ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(pad)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Spacer(Modifier.height(12.dp))
                Text(
                    "Sugestões",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    "Consumidos nos últimos 30 dias + vencendo em 7 dias",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(8.dp))
            }
            if (sugestoes.isEmpty()) {
                item {
                    Text(
                        "Sem sugestões — consuma itens ou cadastre validades.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 24.dp)
                    )
                }
            } else {
                items(sugestoes, key = { it.nome }) { s ->
                    SugestaoCard(
                        sugestao = s,
                        onAlternar = { vm.alternar(s.nome) },
                        onMais = { vm.ajustarQtd(s.nome, passo(s.unidade)) },
                        onMenos = { vm.ajustarQtd(s.nome, -passo(s.unidade)) }
                    )
                }
            }
            item {
                Spacer(Modifier.height(4.dp))
                // CTA único da tela, sempre LimaNeon (identidade, regra 5).
                Button(
                    onClick = { vm.gerarTextoReposicao() },
                    enabled = selecionadas > 0,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LimaNeon,
                        contentColor = UvaNoite,
                        disabledContainerColor = LimaNeon.copy(alpha = 0.3f)
                    )
                ) {
                    Text(
                        if (selecionadas > 0) "Gerar texto ($selecionadas)" else "Gerar texto",
                        fontWeight = FontWeight.Black
                    )
                }
            }
            if (texto.isNotBlank()) {
                item {
                    OutlinedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        border = BorderStroke(2.dp, Tinta.copy(alpha = 0.9f)),
                        colors = CardDefaults.outlinedCardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Text(
                                texto,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(Modifier.height(8.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    onClick = { compartilhar(contexto, texto) },
                                    modifier = Modifier.weight(1f)
                                ) { Text("Compartilhar") }
                                OutlinedButton(
                                    onClick = {
                                        copiar(contexto, texto)
                                        escopo.launch { snackbar.showSnackbar("Texto copiado ✅") }
                                    },
                                    modifier = Modifier.weight(1f)
                                ) { Text("Copiar") }
                            }
                            Text(
                                "Cole no Importar do ListaCompras v2.0",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun passo(unidade: String): Double = when (unidade) {
    "kg", "L" -> 0.5
    "g", "ml" -> 100.0
    else -> 1.0
}

@Composable
private fun SugestaoCard(
    sugestao: Sugestao,
    onAlternar: () -> Unit,
    onMais: () -> Unit,
    onMenos: () -> Unit
) {
    OutlinedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(2.dp, Tinta.copy(alpha = 0.9f)),
        colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = sugestao.marcada,
                onCheckedChange = { onAlternar() },
                colors = CheckboxDefaults.colors(checkedColor = RoxoEletrico)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    sugestao.nome,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    maxLines = 2
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = if (sugestao.origem == OrigemSugestao.CONSUMO) LimaNeon else Ambar,
                        contentColor = UvaNoite,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            if (sugestao.origem == OrigemSugestao.CONSUMO) "CONSUMO" else "VENCE EM 7D",
                            fontWeight = FontWeight.Black,
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    sugestao.precoUnit?.takeIf { it > 0 }?.let {
                        Spacer(Modifier.width(6.dp))
                        Text(
                            "R$ ${formatarReais(it)}/${sugestao.unidade}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            IconButton(onClick = onMenos) { Text("−", fontWeight = FontWeight.Black) }
            Text(
                "${formatarQtd(sugestao.quantidade)}${sugestao.unidade}",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
            )
            IconButton(onClick = onMais) { Text("+", fontWeight = FontWeight.Black) }
        }
    }
}

private fun compartilhar(contexto: Context, texto: String) {
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, texto)
    }
    contexto.startActivity(Intent.createChooser(intent, "Enviar via"))
}

private fun copiar(contexto: Context, texto: String) {
    val clipboard = contexto.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("lista_reposicao", texto))
}
