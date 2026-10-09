package br.com.despensa.presentation.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.despensa.R

// Tokens docs/07-paleta-v3.md — "Maré de Manhã" (troca SOMENTE de cor sobre a forma Feira).
// FORMA v2 intacta: cantos 24/28/16dp, Fraunces Bold + Inter, sombras suaves, motion E03–E10.
// Light: fundo BrancoMare · Dark: fundo AzulNoite (nunca uva, nunca vinho).
// VETO: #0E9F8A NUNCA como texto/fill de leitura (3,21:1 ❌) — só acento gráfico grande
// (anel 3dp, ilustração). Leitura usa TurquesaProfunda #0B6E5F (5,97/6,16 ✅).
// CTA LaranjaViva SEMPRE com tinta escura (TintaMare 4,72 ✅); branco sobre laranja (2,80 ❌) proibido.
val BrancoMare = Color(0xFFFFFBF4)
val Papel = Color(0xFFFFFFFF)
val Nevoa = Color(0xFFEAF3F3)
val TintaMare = Color(0xFF14343C)
val PetroleoSec = Color(0xFF47626E)
val TurquesaProfunda = Color(0xFF0B6E5F)
val NevoaTurquesa = Color(0xFFE0F2EE)
val LaranjaViva = Color(0xFFF97316)
val AmbarFeira = Color(0xFFFBBF24)
val LinhaAzul = Color(0xFFD8E6E8)
val VermelhoQueimado = Color(0xFFB91C1C)
val LaranjaQueimada = Color(0xFFC2410C)
val RosaQueimadoFundo = Color(0xFFFDECEC)

// Dark "azul-noite profundo".
val AzulNoite = Color(0xFF0A2028)
val CestoAzul = Color(0xFF14343C)
val AzulCinza = Color(0xFFB8CDD4)
val TurquesaClara = Color(0xFF5EEAD4)
val LaranjaClara = Color(0xFFFDBA74)
val AmbarClaro = Color(0xFFFCD34D)
val BordaNoiteAzul = Color(0xFF26414B)
val VermelhoNoite = Color(0xFFFCA5A5)

// §(c) — display serifada (Fraunces Bold) + corpo grotesca (Inter).
// TTFs estáticos subsetados em res/font/ (~179KB no APK).
val DisplayFeira = FontFamily(Font(R.font.fraunces_bold, FontWeight.Bold))
val CorpoFeira = FontFamily(
    Font(R.font.inter_regular, FontWeight.Normal),
    Font(R.font.inter_medium, FontWeight.Medium),
    Font(R.font.inter_bold, FontWeight.Bold)
)

private val TipografiaFeira = Typography(
    displayLarge = TextStyle(
        fontFamily = DisplayFeira, fontWeight = FontWeight.Bold,
        fontSize = 52.sp, lineHeight = 56.sp
    ),
    displayMedium = TextStyle(
        fontFamily = DisplayFeira, fontWeight = FontWeight.Bold,
        fontSize = 40.sp, lineHeight = 44.sp
    ),
    titleLarge = TextStyle(
        fontFamily = DisplayFeira, fontWeight = FontWeight.Bold,
        fontSize = 22.sp, lineHeight = 28.sp
    ),
    titleMedium = TextStyle(
        fontFamily = DisplayFeira, fontWeight = FontWeight.Bold,
        fontSize = 18.sp, lineHeight = 24.sp
    ),
    titleSmall = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Bold,
        fontSize = 14.sp, lineHeight = 20.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Normal,
        fontSize = 16.sp, lineHeight = 24.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Normal,
        fontSize = 14.sp, lineHeight = 20.sp
    ),
    bodySmall = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Normal,
        fontSize = 12.sp, lineHeight = 16.sp
    ),
    labelLarge = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Medium,
        fontSize = 14.sp, lineHeight = 20.sp
    ),
    labelMedium = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Medium,
        fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = CorpoFeira, fontWeight = FontWeight.Bold,
        fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.5.sp
    )
)

/** §(b) — "cesto, não placa": cards 24dp, hero/dialog 28dp, inputs 16dp. */
val FormasFeira = Shapes(
    extraSmall = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
    small = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(24.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(28.dp),
    extraLarge = androidx.compose.foundation.shape.RoundedCornerShape(28.dp)
)

private val CoresClaras = lightColorScheme(
    primary = TurquesaProfunda,
    onPrimary = Color.White,
    primaryContainer = NevoaTurquesa,
    onPrimaryContainer = TurquesaProfunda,
    secondary = LaranjaViva,
    onSecondary = TintaMare,
    tertiary = AmbarFeira,
    onTertiary = TintaMare,
    background = BrancoMare,
    onBackground = TintaMare,
    surface = Papel,
    onSurface = TintaMare,
    surfaceVariant = Nevoa,
    onSurfaceVariant = PetroleoSec,
    outline = LinhaAzul,
    error = VermelhoQueimado,
    onError = Color.White
)

private val CoresEscuras = darkColorScheme(
    primary = TurquesaClara,
    onPrimary = AzulNoite,
    primaryContainer = CestoAzul,
    onPrimaryContainer = BrancoMare,
    secondary = LaranjaClara,
    onSecondary = AzulNoite,
    tertiary = AmbarClaro,
    onTertiary = AzulNoite,
    background = AzulNoite,
    onBackground = BrancoMare,
    surface = AzulNoite,
    onSurface = BrancoMare,
    surfaceVariant = CestoAzul,
    onSurfaceVariant = AzulCinza,
    outline = BordaNoiteAzul,
    error = VermelhoNoite,
    onError = AzulNoite
)

@Composable
fun DespensaTheme(escuro: Boolean = false, content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (escuro) CoresEscuras else CoresClaras,
        typography = TipografiaFeira,
        shapes = FormasFeira,
        content = content
    )
}
