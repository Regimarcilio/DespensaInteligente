package br.com.despensa.presentation.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Tokens docs/07-identidade-visual.md — "Noite Neon na Cozinha" (dark-first)
val UvaNoite = Color(0xFF14101F)
val UvaProfunda = Color(0xFF3B0A54)
val RoxoEletrico = Color(0xFF7C4DFF)
val LimaNeon = Color(0xFFC6FF00)
val Ambar = Color(0xFFFFB300)
val Pimenta = Color(0xFFFF3D00)
val Creme = Color(0xFFFFF6E9)
val Tinta = Color(0xFF1A1025)

private val CoresEscuras = darkColorScheme(
    primary = RoxoEletrico,
    onPrimary = Color.White,
    primaryContainer = UvaProfunda,
    onPrimaryContainer = Creme,
    secondary = LimaNeon,
    onSecondary = UvaNoite,
    secondaryContainer = UvaProfunda,
    onSecondaryContainer = LimaNeon,
    tertiary = Ambar,
    onTertiary = UvaNoite,
    background = UvaNoite,
    onBackground = Creme,
    surface = UvaNoite,
    onSurface = Creme,
    surfaceVariant = UvaProfunda,
    onSurfaceVariant = Creme,
    error = Pimenta,
    onError = Color.White
)

private val CoresClaras = lightColorScheme(
    primary = RoxoEletrico,
    onPrimary = Color.White,
    primaryContainer = Creme,
    onPrimaryContainer = Tinta,
    secondary = UvaProfunda,
    onSecondary = Color.White,
    tertiary = Ambar,
    onTertiary = Tinta,
    background = Creme,
    onBackground = Tinta,
    surface = Creme,
    onSurface = Tinta,
    surfaceVariant = Color(0xFFF0E6D2),
    onSurfaceVariant = Tinta,
    error = Pimenta,
    onError = Color.White
)

@Composable
fun DespensaTheme(escuro: Boolean = true, content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (escuro) CoresEscuras else CoresClaras,
        content = content
    )
}
