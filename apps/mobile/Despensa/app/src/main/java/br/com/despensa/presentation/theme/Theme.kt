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

// Tokens docs/07-estilo-v2.md — "Feira de Manhã" (light-first, substitui o neon).
// Light: fundo CremeFeira · Dark: fundo VinhoNoite (nunca uva).
val CremeFeira = Color(0xFFFAF5EC)
val Papel = Color(0xFFFFFFFF)
val Areia = Color(0xFFF0E6D2)
val Tinta = Color(0xFF2B2118)
val CafeClaro = Color(0xFF6B5D4F)
val VerdeFolha = Color(0xFF2E7D32)
val VerdeFundo = Color(0xFFE5F0E2)
val Tomate = Color(0xFFD9481C)
val Mel = Color(0xFFE8A020)
val PimentaQueimada = Color(0xFFB72C00)
val VerdeMenta = Color(0xFF3E8E4D)
val CinzaSemente = Color(0xFF9C8F80)
val LinhaBorda = Color(0xFFE3D7C0)

// Dark "vinho-noite quentinho".
val VinhoNoite = Color(0xFF201210)
val Cesto = Color(0xFF2E1D16)
val CafeNoite = Color(0xFFC9BBA8)
val VerdeFolhaClaro = Color(0xFF7BC98A)
val TomateClaro = Color(0xFFF4733B)
val MelClaro = Color(0xFFF2B73E)
val PimentaNoite = Color(0xFFFF6B47)
val BordaNoite = Color(0xFF4A342A)

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
    primary = VerdeFolha,
    onPrimary = Color.White,
    primaryContainer = VerdeFundo,
    onPrimaryContainer = VerdeFolha,
    secondary = Tomate,
    onSecondary = CremeFeira,
    tertiary = Mel,
    onTertiary = Tinta,
    background = CremeFeira,
    onBackground = Tinta,
    surface = Papel,
    onSurface = Tinta,
    surfaceVariant = Areia,
    onSurfaceVariant = CafeClaro,
    outline = LinhaBorda,
    error = PimentaQueimada,
    onError = Color.White
)

private val CoresEscuras = darkColorScheme(
    primary = VerdeFolhaClaro,
    onPrimary = VinhoNoite,
    primaryContainer = Cesto,
    onPrimaryContainer = CremeFeira,
    secondary = TomateClaro,
    onSecondary = VinhoNoite,
    tertiary = MelClaro,
    onTertiary = VinhoNoite,
    background = VinhoNoite,
    onBackground = CremeFeira,
    surface = VinhoNoite,
    onSurface = CremeFeira,
    surfaceVariant = Cesto,
    onSurfaceVariant = CafeNoite,
    outline = BordaNoite,
    error = PimentaNoite,
    onError = VinhoNoite
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
