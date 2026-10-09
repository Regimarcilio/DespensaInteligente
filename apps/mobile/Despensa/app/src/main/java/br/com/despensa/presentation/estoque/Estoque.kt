package br.com.despensa.presentation.estoque

import android.app.DatePickerDialog
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.despensa.data.local.dao.EstoqueDao
import br.com.despensa.data.local.entity.EstoqueEntity
import br.com.despensa.data.local.entity.LocalEstoque
import br.com.despensa.domain.StatusValidade
import br.com.despensa.domain.diasParaVencer
import br.com.despensa.domain.statusValidade
import br.com.despensa.domain.validarCadastro
import br.com.despensa.presentation.theme.Ambar
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.Pimenta
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.Tinta
import br.com.despensa.presentation.theme.UvaNoite
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject

val UNIDADES = listOf("un", "kg", "g", "L", "ml")

val LOCAIS_FILTRO: List<Pair<String, LocalEstoque?>> = listOf(
    "Todos" to null,
    "Geladeira" to LocalEstoque.GELADEIRA,
    "Freezer" to LocalEstoque.FREEZER,
    "Despensa" to LocalEstoque.DESPENSA
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class EstoqueViewModel @Inject constructor(
    private val dao: EstoqueDao
) : ViewModel() {
    private val busca = MutableStateFlow("")
    private val filtroLocal = MutableStateFlow<LocalEstoque?>(null)

    val buscaAtual: StateFlow<String> = busca
    val filtroAtual: StateFlow<LocalEstoque?> = filtroLocal

    val itens: StateFlow<List<EstoqueEntity>> =
        combine(busca, filtroLocal) { b, l -> b to l }
            .flatMapLatest { (b, l) -> dao.observar(b.trim(), l) }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun buscar(texto: String) { busca.value = texto }
    fun filtrar(local: LocalEstoque?) { filtroLocal.value = local }

    fun salvar(
        nome: String,
        quantidade: Double,
        unidade: String,
        validade: Long?,
        local: LocalEstoque
    ) = viewModelScope.launch {
        dao.upsert(
            EstoqueEntity(
                nome = nome.trim(),
                quantidade = quantidade,
                unidade = unidade,
                validade = validade,
                local = local
            )
        )
    }

    fun remover(id: String) = viewModelScope.launch { dao.remover(id) }
}

private fun formatarData(epoch: Long): String =
    SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).apply {
        timeZone = TimeZone.getDefault()
    }.format(Date(epoch))

private fun inicioDoDia(epoch: Long): Long {
    val cal = Calendar.getInstance().apply { timeInMillis = epoch }
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}

/** Converte "dd/MM/yyyy" em epoch millis (00h local). Null se vazio; exceção se inválido. */
fun parseDataBr(texto: String): Long? {
    val t = texto.trim()
    if (t.isEmpty()) return null
    val sdf = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).apply {
        isLenient = false
        timeZone = TimeZone.getDefault()
    }
    return sdf.parse(t)?.time?.let { inicioDoDia(it) }
}

/** Máscara simples dd/MM/yyyy enquanto digita (só dígitos, máx 8). */
fun mascaraData(digitos: String): String {
    val d = digitos.filter { it.isDigit() }.take(8)
    return buildString {
        d.forEachIndexed { i, c ->
            if (i == 2 || i == 4) append('/')
            append(c)
        }
    }
}

private fun rotuloLocal(local: LocalEstoque): String = when (local) {
    LocalEstoque.GELADEIRA -> "Geladeira"
    LocalEstoque.FREEZER -> "Freezer"
    LocalEstoque.DESPENSA -> "Despensa"
}

private fun rotuloStatus(s: StatusValidade): String = when (s) {
    StatusValidade.VENCIDO -> "VENCEU"
    StatusValidade.ATENCAO -> "ATENÇÃO"
    StatusValidade.FRESCO -> "FRESCO"
    StatusValidade.SEM_VALIDADE -> "SEM VALIDADE"
}

private fun corStatus(s: StatusValidade): Color = when (s) {
    StatusValidade.VENCIDO -> Pimenta
    StatusValidade.ATENCAO -> Ambar
    StatusValidade.FRESCO -> LimaNeon
    StatusValidade.SEM_VALIDADE -> Color(0xFF9E9E9E)
}

@Composable
fun EstoqueScreen(vm: EstoqueViewModel = hiltViewModel()) {
    val itens by vm.itens.collectAsState()
    val busca by vm.buscaAtual.collectAsState()
    val filtro by vm.filtroAtual.collectAsState()
    var dialogoAberto by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { dialogoAberto = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = "Adicionar") },
                text = { Text("Adicionar", fontWeight = FontWeight.Bold) },
                containerColor = LimaNeon,
                contentColor = UvaNoite
            )
        }
    ) { pad ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(pad)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(Modifier.height(12.dp))
            Text(
                "${itens.size} ${if (itens.size == 1) "item" else "itens"} no estoque",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = busca,
                onValueChange = vm::buscar,
                label = { Text("Buscar item") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(LOCAIS_FILTRO) { (rotulo, local) ->
                    FilterChip(
                        selected = filtro == local,
                        onClick = { vm.filtrar(local) },
                        label = { Text(rotulo, maxLines = 1) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = RoxoEletrico,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            if (itens.isEmpty()) {
                Text(
                    if (busca.isBlank()) "Estoque vazio — toque em Adicionar para cadastrar em <15s."
                    else "Nada encontrado para \"$busca\".",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(vertical = 24.dp)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 88.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(itens, key = { it.id }) { item ->
                        EstoqueCard(item = item, onRemover = { vm.remover(item.id) })
                    }
                }
            }
        }
    }

    if (dialogoAberto) {
        DialogoCadastro(
            onFechar = { dialogoAberto = false },
            onSalvar = { nome, qtd, un, val_, local ->
                vm.salvar(nome, qtd, un, val_, local)
                dialogoAberto = false
            }
        )
    }
}

@Composable
private fun EstoqueCard(item: EstoqueEntity, onRemover: () -> Unit) {
    val agora = System.currentTimeMillis()
    val status = statusValidade(item.validade, agora)
    val dias = diasParaVencer(item.validade, agora)
    val cor = corStatus(status)

    OutlinedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(2.dp, Tinta.copy(alpha = 0.9f)),
        colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    item.nome,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    "${formatarQtd(item.quantidade)} ${item.unidade} • ${rotuloLocal(item.local)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    when {
                        item.validade == null -> "Sem validade"
                        dias != null && dias < 0 -> "Venceu há ${-dias}d • ${formatarData(item.validade)}"
                        dias != null && dias == 0 -> "Vence hoje • ${formatarData(item.validade)}"
                        dias != null -> "Vence em ${dias}d • ${formatarData(item.validade)}"
                        else -> formatarData(item.validade)
                    },
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1
                )
            }
            Spacer(Modifier.width(8.dp))
            // Sticker de validade rotacionado −3° (identidade: selos sempre em caixa alta).
            Surface(
                color = cor,
                contentColor = if (status == StatusValidade.FRESCO || status == StatusValidade.ATENCAO) UvaNoite else Color.White,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.graphicsLayer { rotationZ = -3f }
            ) {
                Text(
                    rotuloStatus(status),
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    maxLines = 1,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                )
            }
            IconButton(onClick = onRemover) {
                Icon(Icons.Filled.Delete, contentDescription = "Remover ${item.nome}")
            }
        }
    }
}

private fun formatarQtd(qtd: Double): String =
    if (qtd % 1.0 == 0.0) qtd.toInt().toString() else qtd.toString()

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DialogoCadastro(
    onFechar: () -> Unit,
    onSalvar: (nome: String, qtd: Double, unidade: String, validade: Long?, local: LocalEstoque) -> Unit
) {
    var nome by remember { mutableStateOf("") }
    var qtdTxt by remember { mutableStateOf("1") }
    var unidade by remember { mutableStateOf("un") }
    var validadeTxt by remember { mutableStateOf("") }
    var local by remember { mutableStateOf(LocalEstoque.DESPENSA) }
    var erro by remember { mutableStateOf<String?>(null) }
    var expandUn by remember { mutableStateOf(false) }
    var expandLocal by remember { mutableStateOf(false) }
    val contexto = LocalContext.current

    AlertDialog(
        onDismissRequest = onFechar,
        title = { Text("Novo item", fontWeight = FontWeight.Bold) },
        text = {
            Column {
                OutlinedTextField(
                    value = nome,
                    onValueChange = { nome = it },
                    label = { Text("Nome*") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = qtdTxt,
                        onValueChange = { qtdTxt = it },
                        label = { Text("Qtd") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    ExposedDropdownMenuBox(
                        expanded = expandUn,
                        onExpandedChange = { expandUn = !expandUn },
                        modifier = Modifier.weight(1f)
                    ) {
                        OutlinedTextField(
                            value = unidade,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Unidade") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandUn) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            singleLine = true
                        )
                        ExposedDropdownMenu(expanded = expandUn, onDismissRequest = { expandUn = false }) {
                            UNIDADES.forEach { u ->
                                DropdownMenuItem(text = { Text(u) }, onClick = { unidade = u; expandUn = false })
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = validadeTxt,
                    onValueChange = { validadeTxt = mascaraData(it) },
                    label = { Text("Validade (dd/MM/yyyy, opcional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("ex 25/12/2026") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    trailingIcon = {
                        TextButton(onClick = {
                            val cal = Calendar.getInstance()
                            DatePickerDialog(
                                contexto,
                                { _, ano, mes, dia ->
                                    validadeTxt = "%02d/%02d/%04d".format(dia, mes + 1, ano)
                                },
                                cal.get(Calendar.YEAR),
                                cal.get(Calendar.MONTH),
                                cal.get(Calendar.DAY_OF_MONTH)
                            ).show()
                        }) { Text("DATA") }
                    }
                )
                Spacer(Modifier.height(8.dp))
                ExposedDropdownMenuBox(expanded = expandLocal, onExpandedChange = { expandLocal = !expandLocal }) {
                    OutlinedTextField(
                        value = rotuloLocal(local),
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Local") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandLocal) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        singleLine = true
                    )
                    ExposedDropdownMenu(expanded = expandLocal, onDismissRequest = { expandLocal = false }) {
                        LocalEstoque.values().forEach { l ->
                            DropdownMenuItem(
                                text = { Text(rotuloLocal(l)) },
                                onClick = { local = l; expandLocal = false }
                            )
                        }
                    }
                }
                erro?.let {
                    Spacer(Modifier.height(8.dp))
                    Text(it, color = MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val qtd = qtdTxt.replace(",", ".").toDoubleOrNull()
                    val erroBase = validarCadastro(nome, qtd)
                    if (erroBase != null) {
                        erro = erroBase
                        return@Button
                    }
                    val validade = try {
                        parseDataBr(validadeTxt)
                    } catch (_: Exception) {
                        erro = "Data inválida (use dd/MM/yyyy)"
                        return@Button
                    }
                    onSalvar(nome, qtd!!, unidade, validade, local)
                },
                colors = ButtonDefaults.buttonColors(containerColor = LimaNeon, contentColor = UvaNoite)
            ) { Text("Salvar", fontWeight = FontWeight.Bold) }
        },
        dismissButton = { TextButton(onClick = onFechar) { Text("Cancelar") } }
    )
}
