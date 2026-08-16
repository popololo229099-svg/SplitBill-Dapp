package com.splitbill.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BinanceYellow = Color(0xFFFCD535)
val BinanceYellowActive = Color(0xFFF0B90B)
val OnPrimaryDark = Color(0xFF181A20)
val CanvasDark = Color(0xFF0B0E11)
val SurfaceCardDark = Color(0xFF1E2329)
val SurfaceElevatedDark = Color(0xFF2B3139)
val BodyTextLight = Color(0xFFEAECEF)
val MutedTextGray = Color(0xFF707A8A)
val MutedTextStrong = Color(0xFF929AA5)
val TradingUp = Color(0xFF0ECB81)
val TradingDown = Color(0xFFF6465D)

private val DarkColorScheme = darkColorScheme(
    primary = BinanceYellow,
    onPrimary = OnPrimaryDark,
    primaryContainer = BinanceYellowActive,
    onPrimaryContainer = OnPrimaryDark,
    secondary = SurfaceElevatedDark,
    onSecondary = BodyTextLight,
    secondaryContainer = SurfaceCardDark,
    onSecondaryContainer = BodyTextLight,
    background = CanvasDark,
    onBackground = BodyTextLight,
    surface = SurfaceCardDark,
    onSurface = BodyTextLight,
    surfaceVariant = SurfaceElevatedDark,
    onSurfaceVariant = MutedTextGray,
    error = TradingDown,
    onError = Color.White,
    outline = SurfaceElevatedDark
)

@Composable
fun SplitBillTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
