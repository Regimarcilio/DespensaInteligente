package br.com.despensa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.toSize
import androidx.hilt.navigation.compose.hiltViewModel
import br.com.despensa.presentation.economia.EconomiaScreen
import br.com.despensa.presentation.economia.EconomiaViewModel
import br.com.despensa.presentation.estoque.EstoqueScreen
import br.com.despensa.presentation.estoque.EstoqueViewModel
import br.com.despensa.presentation.lista.ListaScreen
import br.com.despensa.presentation.lista.ListaViewModel
import br.com.despensa.presentation.notif.PedidoPermissaoNotificacao
import br.com.despensa.presentation.theme.DespensaTheme
import br.com.despensa.presentation.theme.Dur
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.UvaProfunda
import br.com.despensa.presentation.theme.fundoComAr
import br.com.despensa.presentation.theme.lembrarMovimentoReduzido
import dagger.hilt.android.AndroidEntryPoint

private enum class Aba(val rotulo: String, val icone: androidx.compose.ui.graphics.vector.ImageVector) {
    ESTOQUE("Estoque", Icons.Filled.Inventory),
    LISTA("Lista", Icons.Filled.ShoppingCart),
    ECONOMIA("R$", Icons.Filled.Savings)
}

@OptIn(ExperimentalMaterial3Api::class)
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Sprint 3: claro+escuro segue o sistema (US10 full com TalkBack vem na S4).
            val escuro = isSystemInDarkTheme()
            DespensaTheme(escuro = escuro) {
                // Sprint 2 (RF-002): rationale próprio + pedido do sistema na 1ª abertura.
                PedidoPermissaoNotificacao()
                var aba by rememberSaveable { mutableStateOf(Aba.ESTOQUE) }
                val vmEstoque: EstoqueViewModel = hiltViewModel()
                val itens by vmEstoque.itens.collectAsState()
                val calmo = lembrarMovimentoReduzido()

                // E02 — header com gradiente vivo (respiração neon, 4000ms Reverse).
                // Reduce-motion: fase congelada em 0.5f. Tamanho via onSizeChanged
                // (graphicsLayer/offsets — sem recomposição por frame fora do TopAppBar).
                var barraSize by remember { mutableStateOf(Size.Zero) }
                val faseE02 by if (calmo) {
                    remember { mutableStateOf(0.5f) }
                } else {
                    rememberInfiniteTransition(label = "header-vivo").animateFloat(
                        initialValue = 0f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(4000, easing = LinearEasing),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "header-fase"
                    )
                }
                val gradienteVivo = remember(faseE02, barraSize) {
                    val w = barraSize.width.coerceAtLeast(1f)
                    val h = barraSize.height.coerceAtLeast(1f)
                    Brush.linearGradient(
                        colors = listOf(UvaProfunda, RoxoEletrico, UvaProfunda),
                        start = Offset(faseE02 * w, 0f),
                        end = Offset(faseE02 * w + w * 0.6f, h)
                    )
                }
                val tituloAba = when (aba) {
                    Aba.ESTOQUE -> "Despensa"
                    Aba.LISTA -> "Lista"
                    Aba.ECONOMIA -> "R$"
                }
                val subtituloAba = when (aba) {
                    Aba.ESTOQUE ->
                        "${itens.size} ${if (itens.size == 1) "item" else "itens"} em estoque"
                    Aba.LISTA -> "Exporte para o ListaCompras"
                    Aba.ECONOMIA -> "Salvos vs perdidos no mês"
                }

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        tituloAba,
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.Black,
                                            // E02: título LimaNeon com glow real
                                            // (Shadow lima 45% blur 12 — decorativo, AA já ok).
                                            shadow = Shadow(
                                                LimaNeon.copy(alpha = 0.45f),
                                                offset = Offset(0f, 2f),
                                                blurRadius = 12f
                                            )
                                        ),
                                        color = LimaNeon
                                    )
                                    // E02: subtítulo troca com fade + slideY 6dp, 200ms.
                                    AnimatedContent(
                                        targetState = subtituloAba,
                                        transitionSpec = {
                                            fadeIn(tween(Dur.P200)) +
                                                androidx.compose.animation.slideInVertically(
                                                    tween(Dur.P200)
                                                ) { 6 } togetherWith fadeOut(tween(Dur.P200))
                                        },
                                        label = "subtitulo-aba"
                                    ) { sub ->
                                        Text(
                                            sub,
                                            style = MaterialTheme.typography.labelMedium,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer
                                        )
                                    }
                                }
                            },
                            modifier = Modifier
                                .onSizeChanged { barraSize = it.toSize() }
                                .background(gradienteVivo),
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = Color.Transparent
                            )
                        )
                    },
                    bottomBar = {
                        NavigationBar {
                            Aba.values().forEach { destino ->
                                val sel = aba == destino
                                NavigationBarItem(
                                    selected = sel,
                                    onClick = { aba = destino },
                                    icon = {
                                        Icon(
                                            destino.icone,
                                            contentDescription = destino.rotulo
                                        )
                                    },
                                    // E10: label acesa quando selecionada
                                    // (Bold 12sp LimaNeon × Medium onSurfaceVariant).
                                    label = {
                                        Text(
                                            destino.rotulo,
                                            fontSize = 12.sp,
                                            fontWeight = if (sel) FontWeight.Bold else FontWeight.Medium,
                                            color = if (sel) LimaNeon
                                            else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = LimaNeon,
                                        // E10: pílula lima 22% (antes: UvaProfunda
                                        // tom-sobre-tom que sumia no fundo).
                                        indicatorColor = LimaNeon.copy(alpha = 0.22f)
                                    )
                                )
                            }
                        }
                    }
                ) { pad ->
                    // E01 — 1 Box com ar por TELA (não por card), estático, custo ~0.
                    Box(
                        Modifier
                            .fillMaxSize()
                            .padding(pad)
                            .fundoComAr(escuro)
                    ) {
                        // E10 — troca de aba com crossfade (fade 200ms +
                        // slideHorizontal it/12, saída fade 150ms).
                        AnimatedContent(
                            targetState = aba,
                            transitionSpec = {
                                (fadeIn(tween(Dur.P200)) +
                                    slideInHorizontally(tween(Dur.P200)) { it / 12 }) togetherWith
                                    fadeOut(tween(Dur.P150))
                            },
                            label = "troca-aba"
                        ) { abaAtual ->
                            when (abaAtual) {
                                Aba.ESTOQUE -> EstoqueScreen(vmEstoque)
                                Aba.LISTA -> {
                                    val vmLista: ListaViewModel = hiltViewModel()
                                    ListaScreen(vmLista)
                                }
                                Aba.ECONOMIA -> {
                                    val vmEco: EconomiaViewModel = hiltViewModel()
                                    EconomiaScreen(vmEco)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
