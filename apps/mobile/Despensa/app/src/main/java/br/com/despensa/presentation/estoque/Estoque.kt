package br.com.despensa.presentation.estoque

import android.app.DatePickerDialog
import android.content.Intent
import android.provider.MediaStore
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
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
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.despensa.data.foto.FotoStore
import br.com.despensa.data.local.dao.BaixaDao
import br.com.despensa.data.local.dao.EstoqueDao
import br.com.despensa.data.local.entity.BaixaEntity
import br.com.despensa.data.local.entity.EstoqueEntity
import br.com.despensa.data.local.entity.LocalEstoque
import br.com.despensa.data.local.entity.MotivoBaixa
import br.com.despensa.domain.StatusValidade
import br.com.despensa.domain.diasParaVencer
import br.com.despensa.domain.statusValidade
import br.com.despensa.domain.validarCadastro
import br.com.despensa.domain.valorTotalBaixa
import br.com.despensa.presentation.theme.Ambar
import br.com.despensa.presentation.theme.Dur
import br.com.despensa.presentation.theme.EsqueletoCard
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.Pimenta
import br.com.despensa.presentation.theme.PimentaEscura
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.Tinta
import br.com.despensa.presentation.theme.UvaNoite
import br.com.despensa.presentation.theme.atrasoStagger
import br.com.despensa.presentation.theme.escalaPress
import br.com.despensa.presentation.theme.lembrarMovimentoReduzido
import br.com.despensa.presentation.theme.specCalma
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
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
    private val dao: EstoqueDao,
    private val baixaDao: BaixaDao
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
        local: LocalEstoque,
        precoRef: Double?,
        fotoPath: String? = null
    ) = viewModelScope.launch {
        dao.upsert(
            EstoqueEntity(
                nome = nome.trim(),
                quantidade = quantidade,
                unidade = unidade,
                validade = validade,
                local = local,
                fotoPath = fotoPath,
                precoRef = precoRef
            )
        )
    }

    fun remover(id: String) = viewModelScope.launch { dao.remover(id) }

    /**
     * Baixa em 1 gesto (RF-003): remove do estoque e registra a baixa com
     * valorTotal = qtd × precoRef (0.0 sem preço). Chama [aoFeito] p/ Snackbar.
     */
    fun darBaixa(item: EstoqueEntity, motivo: MotivoBaixa, aoFeito: (String) -> Unit) =
        viewModelScope.launch {
            baixaDao.registrar(
                BaixaEntity(
                    nome = item.nome,
                    quantidade = item.quantidade,
                    unidade = item.unidade,
                    valorTotal = valorTotalBaixa(item.quantidade, item.precoRef),
                    motivo = motivo
                )
            )
            dao.remover(item.id)
            aoFeito(
                if (motivo == MotivoBaixa.CONSUMIDO) "${item.nome} consumido ✅"
                else "${item.nome} descartado 🗑️"
            )
        }
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

/** Converte "12,50"/"12.50" em Double. Null se vazio; exceção se inválido ou negativo. */
fun parsePrecoBr(texto: String): Double? {
    val t = texto.trim().replace("R$", "").trim()
    if (t.isEmpty()) return null
    val valor = t.replace(",", ".").toDoubleOrNull()
        ?: throw IllegalArgumentException("Preço inválido")
    if (valor < 0) throw IllegalArgumentException("Preço inválido")
    return valor
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
    // §2.2 AA: 0xFF9E9E9E sobre dark reprova como texto — selo pequeno elevado
    // p/ 0xFFBDBDBD em 11sp Black.
    StatusValidade.SEM_VALIDADE -> Color(0xFFBDBDBD)
}

/**
 * Issue #3: no tema claro (fundo Creme) o Pimenta puro com texto branco não passa no
 * contraste AA — usa [PimentaEscura]. Dark mantém o neon da identidade.
 */
private fun corFundoSticker(s: StatusValidade, escuro: Boolean): Color = when (s) {
    StatusValidade.VENCIDO -> if (escuro) Pimenta else PimentaEscura
    else -> corStatus(s)
}

@Composable
fun EstoqueScreen(vm: EstoqueViewModel = hiltViewModel()) {
    val itens by vm.itens.collectAsState()
    val busca by vm.buscaAtual.collectAsState()
    val filtro by vm.filtroAtual.collectAsState()
    var dialogoAberto by remember { mutableStateOf(false) }
    val snackbar = remember { SnackbarHostState() }
    val escopo = rememberCoroutineScope()
    val calmo = lembrarMovimentoReduzido()

    // E08 — janela de primeira coleta (WhileSubscribed): skeleton com shimmer
    // em vez do "Estoque vazio…" enquanto o banco popula. Sem mudar fluxos:
    // só timing de UI; com banco populado os itens chegam e o skeleton sai.
    var frio by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        delay(600)
        frio = false
    }
    val mostrandoSkeleton = frio && itens.isEmpty() && busca.isBlank() && filtro == null

    // E04 — marca ids já animados: scroll de volta não re-anima.
    val vistos = remember { mutableStateMapOf<String, Boolean>() }

    // E06+E10 — FAB: press 0.97 × pulse 1.0→1.04 (1800ms Reverse infinito).
    val interFab = remember { MutableInteractionSource() }
    val fabPressionado by interFab.collectIsPressedAsState()
    val fabPress by animateFloatAsState(
        targetValue = if (fabPressionado && !calmo) 0.97f else 1f,
        animationSpec = specCalma(tween(Dur.P120, easing = FastOutSlowInEasing), calmo),
        label = "fab-press"
    )
    val fabPulse by if (calmo) {
        remember { mutableStateOf(1f) }
    } else {
        rememberInfiniteTransition(label = "fab-pulse").animateFloat(
            initialValue = 1f,
            targetValue = 1.04f,
            animationSpec = infiniteRepeatable(
                animation = tween(1800),
                repeatMode = RepeatMode.Reverse
            ),
            label = "fab-pulse-fase"
        )
    }

    fun avisar(msg: String) {
        escopo.launch { snackbar.showSnackbar(msg) }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            // E10 — some (shrink 200ms) quando o diálogo abre.
            AnimatedVisibility(
                visible = !dialogoAberto,
                enter = scaleIn(specCalma(tween(Dur.P200), calmo)) +
                    fadeIn(specCalma(tween(Dur.P200), calmo)),
                exit = scaleOut(specCalma(tween(Dur.P200), calmo)) +
                    fadeOut(specCalma(tween(Dur.P200), calmo)),
                label = "fab-some"
            ) {
                ExtendedFloatingActionButton(
                    onClick = { dialogoAberto = true },
                    modifier = Modifier
                        .semantics {
                            contentDescription = "Adicionar item ao estoque"
                            onClick(label = "Adicionar item ao estoque", action = null)
                        }
                        .graphicsLayer(scaleX = fabPress * fabPulse, scaleY = fabPress * fabPulse)
                        // E10 — glow LimaNeon 35% blur 8dp SÓ no FAB
                        // (1 shadow, fora da lista rolável).
                        .shadow(
                            8.dp,
                            RoundedCornerShape(16.dp),
                            spotColor = LimaNeon.copy(alpha = 0.35f)
                        ),
                    interactionSource = interFab,
                    icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                    text = { Text("Adicionar", fontWeight = FontWeight.Bold) },
                    containerColor = LimaNeon,
                    contentColor = UvaNoite
                )
            }
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
            Text(
                "Arraste → consumir · ← descartar",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
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
                    // E06 — FilterChip com press scale (interactionSource próprio).
                    val interChip = remember(rotulo) { MutableInteractionSource() }
                    FilterChip(
                        selected = filtro == local,
                        onClick = { vm.filtrar(local) },
                        label = { Text(rotulo, maxLines = 1) },
                        interactionSource = interChip,
                        modifier = Modifier.escalaPress(interChip, calmo),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = RoxoEletrico,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            if (mostrandoSkeleton) {
                // E08 — 3 fantasmas com shimmer (estáticos com calmo).
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    repeat(3) {
                        EsqueletoCard(calmo = calmo, descricao = "Carregando estoque")
                    }
                }
            } else if (itens.isEmpty()) {
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
                    itemsIndexed(itens, key = { _, it -> it.id }) { index, item ->
                        // E04 — entrada escalonada: fade 220 + slideY it/6 +
                        // scale 0.96, delay min(index*40, 400). Só 1ª composição.
                        val primeira = vistos[item.id] != true
                        val atraso = atrasoStagger(index)
                        AnimatedVisibility(
                            visible = true,
                            enter = if (!primeira || calmo) EnterTransition.None else (
                                fadeIn(tween(Dur.P200 + 20, delayMillis = atraso)) +
                                    slideInVertically(
                                        tween(Dur.P200 + 80, delayMillis = atraso)
                                    ) { it / 6 } +
                                    scaleIn(
                                        initialScale = 0.96f,
                                        animationSpec = tween(Dur.P200 + 80, delayMillis = atraso)
                                    )
                                ),
                            // Saída de baixa confirmada: fade + encolhe, 200ms.
                            exit = fadeOut(tween(Dur.P200)) +
                                shrinkVertically(tween(Dur.P200)),
                            label = "stagger-$index"
                        ) {
                            ItemDeslizavel(
                                item = item,
                                onConsumir = { vm.darBaixa(item, MotivoBaixa.CONSUMIDO, ::avisar) },
                                onDescartar = { vm.darBaixa(item, MotivoBaixa.DESCARTADO, ::avisar) }
                            ) {
                                EstoqueCard(
                                    item = item,
                                    onConsumir = { vm.darBaixa(item, MotivoBaixa.CONSUMIDO, ::avisar) },
                                    onDescartar = { vm.darBaixa(item, MotivoBaixa.DESCARTADO, ::avisar) },
                                    onRemover = { vm.remover(item.id) },
                                    calmo = calmo
                                )
                            }
                        }
                        LaunchedEffect(item.id) { vistos[item.id] = true }
                    }
                }
            }
        }
    }

    if (dialogoAberto) {
        DialogoCadastro(
            onFechar = { dialogoAberto = false },
            onSalvar = { nome, qtd, un, val_, local, preco, foto ->
                vm.salvar(nome, qtd, un, val_, local, preco, foto)
                dialogoAberto = false
            },
            calmo = calmo
        )
    }
}

/**
 * Swipe de baixa (US05): direita (start→end, LimaNeon + Check) = Consumir;
 * esquerda (end→start, Pimenta + Delete) = Descartar.
 * P3: HapticFeedback no confirmValueChange (gesto físico, não só visual).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ItemDeslizavel(
    item: EstoqueEntity,
    onConsumir: () -> Unit,
    onDescartar: () -> Unit,
    conteudo: @Composable () -> Unit
) {
    val haptico = LocalHapticFeedback.current
    val estado = rememberSwipeToDismissBoxState(
        confirmValueChange = { direcao ->
            when (direcao) {
                SwipeToDismissBoxValue.StartToEnd -> {
                    haptico.performHapticFeedback(HapticFeedbackType.LongPress)
                    onConsumir()
                    true
                }
                SwipeToDismissBoxValue.EndToStart -> {
                    haptico.performHapticFeedback(HapticFeedbackType.LongPress)
                    onDescartar()
                    true
                }
                SwipeToDismissBoxValue.Settled -> false
            }
        }
    )
    SwipeToDismissBox(
        state = estado,
        backgroundContent = {
            val direcao = estado.targetValue
            val paraDireita = direcao == SwipeToDismissBoxValue.StartToEnd
            val cor = if (paraDireita) LimaNeon else Pimenta
            val tinta = if (paraDireita) UvaNoite else Color.White
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(cor, RoundedCornerShape(18.dp))
                    .padding(horizontal = 16.dp),
                contentAlignment = if (paraDireita) Alignment.CenterStart else Alignment.CenterEnd
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (paraDireita) {
                        Icon(Icons.Filled.Check, contentDescription = null, tint = tinta)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "Consumir ${item.nome}",
                            fontWeight = FontWeight.Black,
                            color = tinta,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    } else {
                        Text(
                            "Descartar ${item.nome}",
                            fontWeight = FontWeight.Black,
                            color = tinta,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.Filled.Delete, contentDescription = null, tint = tinta)
                    }
                }
            }
        },
        content = { conteudo() }
    )
}

@Composable
private fun EstoqueCard(
    item: EstoqueEntity,
    onConsumir: () -> Unit,
    onDescartar: () -> Unit,
    onRemover: () -> Unit,
    calmo: Boolean = false
) {
    val agora = System.currentTimeMillis()
    val status = statusValidade(item.validade, agora)
    val dias = diasParaVencer(item.validade, agora)
    val escuro = isSystemInDarkTheme()
    val corAlvo = corFundoSticker(status, escuro)
    var menuAberto by remember { mutableStateOf(false) }
    var ampliada by remember { mutableStateOf(false) }
    val temFoto = FotoStore.fotoExiste(item.fotoPath)

    // E07 — sticker com cor animada (250ms) + pop keyed no status:
    // 1.0 → 1.18 → 1.0 spring(500, 0.5) ≤250ms, rotação −3° → −1° → −3°.
    // Reduce-motion: troca instantânea, sem pop.
    val corSticker by androidx.compose.animation.animateColorAsState(
        targetValue = corAlvo,
        animationSpec = specCalma(tween(Dur.P250, easing = FastOutSlowInEasing), calmo),
        label = "sticker-cor"
    )
    var popOn by remember { mutableStateOf(false) }
    LaunchedEffect(status) {
        if (!calmo) {
            popOn = true
            delay(125)
            popOn = false
        }
    }
    val popS by animateFloatAsState(
        targetValue = if (popOn && !calmo) 1.18f else 1f,
        animationSpec = specCalma(spring(stiffness = 500f, dampingRatio = 0.5f), calmo),
        label = "sticker-pop"
    )
    val popR by animateFloatAsState(
        targetValue = if (popOn && !calmo) -1f else -3f,
        animationSpec = specCalma(spring(stiffness = 500f, dampingRatio = 0.5f), calmo),
        label = "sticker-rot"
    )
    val venceu = status == StatusValidade.VENCIDO

    // E06 — press scale nos tocáveis do card (thumb + menu).
    val interThumb = remember(item.id) { MutableInteractionSource() }
    val interMenu = remember(item.id) { MutableInteractionSource() }

    // E05 — sombra dura deslocada 4dp (sólida, sem blur) + expansão com
    // spring(300, 0.7). Contenção: nada de Modifier.shadow/blur no item.
    Box(modifier = Modifier.fillMaxWidth()) {
        Box(
            Modifier
                .matchParentSize()
                .padding(start = 4.dp, top = 4.dp)
                .background(Tinta, RoundedCornerShape(18.dp))
        )
        OutlinedCard(
            modifier = Modifier
                .fillMaxWidth()
                .animateContentSize(
                    animationSpec = specCalma(
                        spring(stiffness = 300f, dampingRatio = 0.7f),
                        calmo
                    )
                ),
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
                // Issue #1: thumbnail 56dp da foto; toque amplia (contentDescription p/ TalkBack).
                if (temFoto) {
                    val bitmap = remember(item.fotoPath) {
                        FotoStore.decodificarAmostrado(item.fotoPath!!)
                    }
                    if (bitmap != null) {
                        Image(
                            bitmap = bitmap.asImageBitmap(),
                            contentDescription = "Foto de ${item.nome}. Toque para ampliar",
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .escalaPress(interThumb, calmo)
                                .clickable(
                                    interactionSource = interThumb,
                                    indication = androidx.compose.foundation.LocalIndication.current,
                                    onClickLabel = "Ampliar foto de ${item.nome}"
                                ) { ampliada = true }
                        )
                    } else {
                        Icon(
                            Icons.Filled.Image,
                            contentDescription = null,
                            modifier = Modifier.size(56.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    Icon(
                        Icons.Filled.Image,
                        contentDescription = null,
                        modifier = Modifier.size(56.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    )
                }
                Spacer(Modifier.width(8.dp))
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
                // VENCEU: borda White 1dp + glow Pimenta 40% blur 8dp
                // (só no sticker — viewport tem ≤3, contenção §2.1).
                Surface(
                    color = corSticker,
                    contentColor = if (status == StatusValidade.FRESCO || status == StatusValidade.ATENCAO) UvaNoite else Color.White,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .graphicsLayer(rotationZ = popR, scaleX = popS, scaleY = popS)
                        .shadow(
                            if (venceu) 8.dp else 0.dp,
                            RoundedCornerShape(8.dp),
                            spotColor = Pimenta.copy(alpha = 0.4f)
                        )
                        .then(
                            if (venceu) Modifier.border(
                                1.dp,
                                Color.White,
                                RoundedCornerShape(8.dp)
                            ) else Modifier
                        )
                ) {
                    Text(
                        rotuloStatus(status),
                        fontWeight = FontWeight.Black,
                        fontSize = 11.sp,
                        maxLines = 1,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                    )
                }
                // Issue #3: swipe não é acessível — Consumir/Descartar também no menu "···".
                Box {
                    IconButton(
                        onClick = { menuAberto = true },
                        interactionSource = interMenu,
                        modifier = Modifier
                            .escalaPress(interMenu, calmo)
                            .semantics {
                                onClick(label = "Mais ações para ${item.nome}", action = null)
                            }
                    ) {
                        Icon(Icons.Filled.MoreVert, contentDescription = "Mais ações para ${item.nome}")
                    }
                    DropdownMenu(expanded = menuAberto, onDismissRequest = { menuAberto = false }) {
                        DropdownMenuItem(
                            text = { Text("Consumir") },
                            onClick = { menuAberto = false; onConsumir() },
                            leadingIcon = { Icon(Icons.Filled.Check, contentDescription = null) }
                        )
                        DropdownMenuItem(
                            text = { Text("Descartar") },
                            onClick = { menuAberto = false; onDescartar() },
                            leadingIcon = { Icon(Icons.Filled.Delete, contentDescription = null) }
                        )
                        DropdownMenuItem(
                            text = { Text("Remover sem baixa") },
                            onClick = { menuAberto = false; onRemover() },
                            leadingIcon = { Icon(Icons.Filled.Delete, contentDescription = null) }
                        )
                    }
                }
            }
        }
    }

    // Diálogo com a foto ampliada (issue #1).
    if (ampliada && temFoto) {
        val grande = remember(item.fotoPath) {
            FotoStore.decodificarAmostrado(item.fotoPath!!, 1024)
        }
        AlertDialog(
            onDismissRequest = { ampliada = false },
            title = { Text(item.nome, fontWeight = FontWeight.Bold) },
            text = {
                if (grande != null) {
                    Image(
                        bitmap = grande.asImageBitmap(),
                        contentDescription = "Foto ampliada de ${item.nome}",
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Text("Não foi possível carregar a foto.")
                }
            },
            confirmButton = {
                TextButton(
                    onClick = { ampliada = false },
                    modifier = Modifier.semantics {
                        onClick(label = "Fechar foto ampliada", action = null)
                    }
                ) { Text("Fechar") }
            }
        )
    }
}

private fun formatarQtd(qtd: Double): String =
    if (qtd % 1.0 == 0.0) qtd.toInt().toString() else qtd.toString()

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DialogoCadastro(
    onFechar: () -> Unit,
    onSalvar: (nome: String, qtd: Double, unidade: String, validade: Long?, local: LocalEstoque, precoRef: Double?, fotoPath: String?) -> Unit,
    calmo: Boolean = false
) {
    var nome by remember { mutableStateOf("") }
    var qtdTxt by remember { mutableStateOf("1") }
    var unidade by remember { mutableStateOf("un") }
    var validadeTxt by remember { mutableStateOf("") }
    var precoTxt by remember { mutableStateOf("") }
    var local by remember { mutableStateOf(LocalEstoque.DESPENSA) }
    var fotoPath by remember { mutableStateOf<String?>(null) }
    var tirandoFoto by remember { mutableStateOf(false) }
    var erro by remember { mutableStateOf<String?>(null) }
    var expandUn by remember { mutableStateOf(false) }
    var expandLocal by remember { mutableStateOf(false) }
    val contexto = LocalContext.current
    val escopo = rememberCoroutineScope()
    val interSalvar = remember { MutableInteractionSource() }
    val interFoto = remember { MutableInteractionSource() }

    // Issue #1: TakePicture SEM permissão CAMERA — Uri FileProvider p/ o app de câmera.
    var fotoTemp: java.io.File? by remember { mutableStateOf(null) }
    val tirarFoto = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok ->
        val temp = fotoTemp
        fotoTemp = null
        if (ok && temp != null) {
            tirandoFoto = true
            escopo.launch(Dispatchers.IO) {
                runCatching { FotoStore.salvarComprimida(contexto, temp) }
                    .onSuccess { fotoPath = it.absolutePath }
                    .onFailure { temp.delete() }
                tirandoFoto = false
            }
        } else {
            temp?.delete()
            if (!ok) {
                Toast.makeText(contexto, "Foto cancelada", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /** Verifica se há app de câmera; sem ele, Toast (fallback issue #1). */
    fun pedirFoto() {
        val temCamera = Intent(MediaStore.ACTION_IMAGE_CAPTURE).resolveActivity(contexto.packageManager) != null
        if (!temCamera) {
            Toast.makeText(contexto, "Sem câmera neste aparelho", Toast.LENGTH_LONG).show()
            return
        }
        val (arquivo, uri) = FotoStore.novaFotoTemp(contexto)
        fotoTemp = arquivo
        tirarFoto.launch(uri)
    }

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
                    value = precoTxt,
                    onValueChange = { precoTxt = it },
                    label = { Text("Preço R$ (opcional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("ex 4,99") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
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
                Spacer(Modifier.height(8.dp))
                // Issue #1: foto opcional (WebP ≤200KB). Sem permissão CAMERA no manifest.
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    val mini = remember(fotoPath) {
                        fotoPath?.takeIf { FotoStore.fotoExiste(it) }?.let {
                            FotoStore.decodificarAmostrado(it)
                        }
                    }
                    if (mini != null) {
                        Image(
                            bitmap = mini.asImageBitmap(),
                            contentDescription = "Foto capturada para o item",
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(12.dp))
                        )
                    } else {
                        Icon(
                            Icons.Filled.PhotoCamera,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    }
                    Button(
                        onClick = ::pedirFoto,
                        enabled = !tirandoFoto,
                        interactionSource = interFoto,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier
                            .escalaPress(interFoto, calmo)
                            .semantics {
                                onClick(label = "Tirar foto do item", action = null)
                            }
                    ) {
                        Text(
                            if (tirandoFoto) "Processando…" else if (fotoPath != null) "Trocar foto" else "Tirar foto",
                            fontWeight = FontWeight.Bold
                        )
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
                    val preco = try {
                        parsePrecoBr(precoTxt)
                    } catch (_: Exception) {
                        erro = "Preço inválido (ex 4,99)"
                        return@Button
                    }
                    onSalvar(nome, qtd!!, unidade, validade, local, preco, fotoPath)
                },
                interactionSource = interSalvar,
                colors = ButtonDefaults.buttonColors(containerColor = LimaNeon, contentColor = UvaNoite),
                modifier = Modifier.escalaPress(interSalvar, calmo)
            ) { Text("Salvar", fontWeight = FontWeight.Bold) }
        },
        dismissButton = { TextButton(onClick = onFechar) { Text("Cancelar") } }
    )
}
