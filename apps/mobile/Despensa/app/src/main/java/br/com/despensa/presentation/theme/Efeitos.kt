package br.com.despensa.presentation.theme

import android.content.Context
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/**
 * Tokens de motion do Sistema Neon Vivo (docs/07-efeitos.md §3).
 * Um único ponto de verdade: toda tela usa estes Dur — nada de ms mágicos.
 */
object Dur {
    const val P120 = 120
    const val P150 = 150
    const val P200 = 200
    const val P250 = 250
    const val P300 = 300
    const val P600 = 600
    const val P800 = 800
    const val P1200 = 1200
}

/**
 * E-contenção §2.3 — único ponto de verdade p/ reduce-motion.
 * Compose não expõe `prefers-reduced-motion`; o equivalente Android é duplo:
 * 1) "Remover animações" do sistema (ANIMATOR_DURATION_SCALE == 0) e
 * 2) TalkBack ativo (exploração por toque — animação concorre com foco sonoro).
 *
 * Uso: `val calmo = lembrarMovimentoReduzido()`
 * calmo == true → tweens/springs viram snap(), infinitos desligados,
 * shimmer vira skeleton estático, stagger some, pop some.
 */
@Composable
fun lembrarMovimentoReduzido(): Boolean {
    val ctx = LocalContext.current
    val semAnim = remember {
        runCatching {
            Settings.Global.getFloat(
                ctx.contentResolver,
                Settings.Global.ANIMATOR_DURATION_SCALE,
                1f
            ) == 0f
        }.getOrDefault(false)
    }
    val talkBack = remember {
        runCatching {
            val am = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
            am.isTouchExplorationEnabled
        }.getOrDefault(false)
    }
    return semAnim || talkBack
}

/** E-contenção §2.3: calmo → snap imediato, senão a spec animada. */
fun <T> specCalma(spec: FiniteAnimationSpec<T>, calmo: Boolean): FiniteAnimationSpec<T> =
    if (calmo) snap() else spec

/**
 * E06 — press scale 0.97 universal (contenção: só graphicsLayer = caminho GPU).
 * O [inter] é o MESMO passado ao clickable/Button/Chip (interactionSource),
 * então o scale segue o pressionado real. Com calmo: sempre 1f (mantém ripple).
 */
@Composable
fun Modifier.escalaPress(inter: MutableInteractionSource, calmo: Boolean): Modifier {
    val pressionado by inter.collectIsPressedAsState()
    val s by androidx.compose.animation.core.animateFloatAsState(
        targetValue = if (pressionado && !calmo) 0.97f else 1f,
        animationSpec = specCalma(
            tween(Dur.P120, easing = androidx.compose.animation.core.FastOutSlowInEasing),
            calmo
        ),
        label = "press-097"
    )
    return this.graphicsLayer(scaleX = s, scaleY = s)
}

/**
 * E01 — fundo com ar: 2 blobs radiais ESTÁTICOS (drawBehind, 1x por tela,
 * nunca por card, sem animação contínua, sem BlurMaskFilter/RenderEffect).
 * Custo ~0 no scroll.
 */
fun Modifier.fundoComAr(escuro: Boolean): Modifier = this.drawBehind {
    val roxo = if (escuro) RoxoEletrico else RoxoProfundo
    val lima = if (escuro) LimaNeon else LimaEscura
    drawCircle(
        Brush.radialGradient(
            listOf(roxo.copy(alpha = if (escuro) 0.18f else 0.10f), Color.Transparent)
        ),
        radius = 320.dp.toPx(),
        center = Offset(size.width * 0.85f, -40f)
    )
    drawCircle(
        Brush.radialGradient(
            listOf(lima.copy(alpha = if (escuro) 0.07f else 0.06f), Color.Transparent)
        ),
        radius = 260.dp.toPx(),
        center = Offset(size.width * 0.05f, size.height * 0.55f)
    )
}

/** E04 — atraso do stagger: 40ms por posição visível, teto 400ms. */
fun atrasoStagger(index: Int): Int = minOf(index * 40, 400)

/**
 * E08 — skeleton fantasma do card (18dp, borda 2dp onSurface 12%,
 * 3 linhas 8dp 12% + thumb 56dp). Shimmer só quando !calmo.
 * Contenção: o infinito vive NESTE escopo (skeleton), nunca no item da lista.
 */
@Composable
fun EsqueletoCard(
    modifier: Modifier = Modifier,
    calmo: Boolean = false,
    descricao: String = "Carregando estoque"
) {
    val escuro = isSystemInDarkTheme()
    val base = if (escuro) Creme.copy(alpha = 0.08f) else Tinta.copy(alpha = 0.06f)
    val brilho = if (escuro) Creme.copy(alpha = 0.18f) else Tinta.copy(alpha = 0.12f)

    val brush = if (calmo) {
        null
    } else {
        val fase by rememberInfiniteTransition(label = "shimmer").animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(Dur.P1200, easing = LinearEasing, delayMillis = 200),
                repeatMode = RepeatMode.Restart
            ),
            label = "shimmer-fase"
        )
        // Faixa de 30% da largura varrendo o card (bytes escaneados = 0: é brush, não query).
        Brush.linearGradient(
            colorStops = arrayOf(
                0f to base,
                (fase * 0.7f).coerceIn(0f, 1f) to base,
                ((fase * 0.7f) + 0.3f).coerceIn(0f, 1f) to brilho,
                1f to base
            )
        )
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(
                brush ?: Brush.linearGradient(listOf(base, base)),
                RoundedCornerShape(18.dp)
            )
            .semantics { contentDescription = descricao }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            Modifier
                .size(56.dp)
                .background(base, RoundedCornerShape(12.dp))
        )
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(Modifier.fillMaxWidth(0.6f).height(8.dp).background(base, RoundedCornerShape(4.dp)))
            Box(Modifier.fillMaxWidth(0.85f).height(8.dp).background(base, RoundedCornerShape(4.dp)))
            Box(Modifier.fillMaxWidth(0.4f).height(8.dp).background(base, RoundedCornerShape(4.dp)))
        }
    }
}

/** E05 — sombra dura deslocada 4dp (camada sólida, custo ~0, sem blur). */
@Composable
fun SombraDura(
    modifier: Modifier = Modifier,
    forma: RoundedCornerShape = RoundedCornerShape(18.dp)
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = 4.dp, top = 4.dp)
            .background(Tinta, forma)
    )
}
