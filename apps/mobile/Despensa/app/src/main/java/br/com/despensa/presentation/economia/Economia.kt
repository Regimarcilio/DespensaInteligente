package br.com.despensa.presentation.economia

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.despensa.data.local.dao.BaixaDao
import br.com.despensa.data.local.dao.EstoqueDao
import br.com.despensa.domain.formatarReais
import br.com.despensa.domain.inicioDoMes
import br.com.despensa.domain.proporcaoConsumida
import br.com.despensa.presentation.theme.LimaEscura
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.Pimenta
import br.com.despensa.presentation.theme.PimentaEscura
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.RoxoProfundo
import br.com.despensa.presentation.theme.Tinta
import br.com.despensa.presentation.theme.UvaNoite
import br.com.despensa.share.BackupJson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

/** Tela R$ (US07): salvos (CONSUMIDO no mês) vs perdidos (DESCARTADO no mês). */
@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class EconomiaViewModel @Inject constructor(
    private val baixaDao: BaixaDao,
    private val estoqueDao: EstoqueDao
) : ViewModel() {
    /** Marco fixo na criação do VM: 1º dia do mês 00h (não recalcula a cada coleta). */
    private val marco: Long = inicioDoMes(System.currentTimeMillis())

    private val salvosFluxo: Flow<Double> = baixaDao.consumidosNoMes(marco)
    private val perdidosFluxo: Flow<Double> = baixaDao.perdidosNoMes(marco)

    val salvos: StateFlow<Double> = salvosFluxo
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val perdidos: StateFlow<Double> = perdidosFluxo
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    /** Expõe o marco p/ testes de UI/preview (default = mês corrente). */
    fun marcoMes(): Long = marco

    /**
     * Issue #2: exporta estoque + baixas em JSON (puro via [BackupJson]).
     * Chamado da UI com o `exportedAt` ISO — IO fica com quem chama.
     */
    suspend fun exportar(exportedAt: String): String =
        BackupJson.export(estoqueDao.listarTudo(), baixaDao.listarTodas(), exportedAt)

    /**
     * Issue #2: importa backup (upsert por id — REPLACE — sem apagar o atual).
     * Retorna o resultado p/ a UI narrar quantos entraram e quantos falharam.
     */
    suspend fun importar(texto: String): BackupJson.ImportResult {
        val res = withContext(Dispatchers.IO) { BackupJson.import(texto) }
        res.itens.forEach { estoqueDao.upsert(it) }
        res.baixas.forEach { baixaDao.registrar(it) }
        return res
    }
}

@Composable
fun EconomiaScreen(vm: EconomiaViewModel = hiltViewModel()) {
    val salvos by vm.salvos.collectAsState()
    val perdidos by vm.perdidos.collectAsState()
    val proporcao = proporcaoConsumida(salvos, perdidos)
    val pctConsumido = (proporcao * 100).toInt()
    // Issue #3: no claro (fundo Creme) o neon puro reprova no contraste AA —
    // usa as variantes escurecidas mantendo o matiz da identidade.
    val escuro = isSystemInDarkTheme()
    val corHero = if (escuro) LimaNeon else LimaEscura
    val corPerda = if (escuro) Pimenta else PimentaEscura
    val corTituloCard = if (escuro) RoxoEletrico else RoxoProfundo
    val contexto = LocalContext.current
    val escopo = rememberCoroutineScope()
    var statusBackup by remember { mutableStateOf<String?>(null) }

    fun avisar(msg: String) {
        statusBackup = msg
        Toast.makeText(contexto, msg, Toast.LENGTH_LONG).show()
    }

    // Issue #2: SAF — CreateDocument p/ exportar, OpenDocument p/ importar.
    val exportarDoc = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        escopo.launch(Dispatchers.IO) {
            val iso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale("pt", "BR")).format(Date())
            val json = vm.exportar(iso)
            runCatching {
                contexto.contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(json.toByteArray())
                } ?: throw IllegalStateException("SAF não abriu o destino")
            }.onSuccess {
                withContext(Dispatchers.Main) { avisar("Backup exportado ✅") }
            }.onFailure {
                withContext(Dispatchers.Main) { avisar("Falha ao exportar: ${it.message}") }
            }
        }
    }
    val importarDoc = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        escopo.launch(Dispatchers.IO) {
            val texto = runCatching {
                contexto.contentResolver.openInputStream(uri)?.use { inn ->
                    inn.readBytes().toString(Charsets.UTF_8)
                } ?: throw IllegalStateException("SAF não abriu o arquivo")
            }.getOrElse {
                withContext(Dispatchers.Main) { avisar("Falha ao ler arquivo: ${it.message}") }
                return@launch
            }
            val res = vm.importar(texto)
            withContext(Dispatchers.Main) {
                if (res.itens.isEmpty() && res.baixas.isEmpty() && res.erros.isNotEmpty()) {
                    avisar("Backup inválido: ${res.erros.first()}")
                } else {
                    val base = "Backup restaurado: ${res.itens.size} itens + ${res.baixas.size} baixas ✅"
                    avisar(if (res.erros.isEmpty()) base else "$base (${res.erros.size} com erro)")
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
    ) {
        Spacer(Modifier.height(16.dp))
        Text(
            "Você salvou em ${mesAtual()}",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        // HERO: valor salvo é o maior texto da tela, display extrabold com brilho lima
        // (identidade, regra 4 — "Noite Neon na Cozinha").
        Text(
            "R$ ${formatarReais(salvos)}",
            fontWeight = FontWeight.Black,
            fontSize = 52.sp,
            lineHeight = 56.sp,
            color = corHero,
            modifier = Modifier.shadow(12.dp, RoundedCornerShape(8.dp))
        )
        Text(
            "R$ ${formatarReais(perdidos)} perdidos",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = corPerda
        )
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            EconomiaCard(
                titulo = "CONSUMIDO",
                valor = salvos,
                cor = corHero,
                corTitulo = corTituloCard,
                modifier = Modifier.weight(1f)
            )
            EconomiaCard(
                titulo = "DESCARTADO",
                valor = perdidos,
                cor = corPerda,
                corTitulo = corTituloCard,
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(Modifier.height(16.dp))
        Text(
            "Consumido × descartado",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
        )
        Spacer(Modifier.height(8.dp))
        // Barra simples consumido×descartado (sem lib nova): lima = consumido, trilho = perdido.
        LinearProgressIndicator(
            progress = { proporcao },
            modifier = Modifier
                .fillMaxWidth()
                .height(14.dp)
                .semantics {
                    contentDescription = "$pctConsumido por cento consumido no mês"
                },
            color = corHero,
            trackColor = corPerda
        )
        Spacer(Modifier.height(4.dp))
        Text(
            if (salvos + perdidos <= 0) "Nada lançado este mês — dê baixa nos itens do estoque."
            else "$pctConsumido% consumido · ${100 - pctConsumido}% descartado",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        // Issue #2: seção Backup (export/import via SAF, padrão ListaCompras).
        Spacer(Modifier.height(24.dp))
        Text(
            "Backup",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
        )
        Text(
            "Salve tudo em JSON e restaure após reinstalar.",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(
                onClick = {
                    val iso = SimpleDateFormat("yyyyMMdd-HHmm", Locale("pt", "BR")).format(Date())
                    exportarDoc.launch("backup-despensa-$iso.json")
                },
                colors = ButtonDefaults.buttonColors(containerColor = LimaNeon, contentColor = UvaNoite),
                modifier = Modifier
                    .weight(1f)
                    .semantics { onClick(label = "Exportar backup em JSON", action = null) }
            ) { Text("Exportar", fontWeight = FontWeight.Bold) }
            OutlinedButton(
                onClick = { importarDoc.launch(arrayOf("application/json")) },
                modifier = Modifier
                    .weight(1f)
                    .semantics { onClick(label = "Importar backup em JSON", action = null) }
            ) { Text("Importar", fontWeight = FontWeight.Bold) }
        }
        statusBackup?.let {
            Spacer(Modifier.height(4.dp))
            Text(
                it,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun EconomiaCard(
    titulo: String,
    valor: Double,
    cor: androidx.compose.ui.graphics.Color,
    corTitulo: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    OutlinedCard(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(2.dp, Tinta.copy(alpha = 0.9f)),
        colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(
                titulo,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                color = corTitulo
            )
            Text(
                "R$ ${formatarReais(valor)}",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                color = cor
            )
        }
    }
}

private fun mesAtual(): String {
    val nome = java.text.SimpleDateFormat("MMMM", java.util.Locale("pt", "BR"))
        .format(java.util.Date())
    return nome.replaceFirstChar { it.uppercase() }
}
