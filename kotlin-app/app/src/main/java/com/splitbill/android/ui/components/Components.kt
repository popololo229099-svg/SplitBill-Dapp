package com.splitbill.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.splitbill.android.data.RecipientPhase
import com.splitbill.android.ui.theme.BinanceYellow
import com.splitbill.android.ui.theme.BodyTextLight
import com.splitbill.android.ui.theme.CanvasDark
import com.splitbill.android.ui.theme.MutedTextGray
import com.splitbill.android.ui.theme.OnPrimaryDark
import com.splitbill.android.ui.theme.SurfaceCardDark
import com.splitbill.android.ui.theme.SurfaceElevatedDark
import com.splitbill.android.ui.theme.TradingDown
import com.splitbill.android.ui.theme.TradingUp

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false
) {
    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        modifier = modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = BinanceYellow,
            contentColor = OnPrimaryDark,
            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            disabledContentColor = MutedTextGray
        )
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.width(20.dp).height(20.dp),
                color = OnPrimaryDark,
                strokeWidth = 2.dp
            )
        } else {
            Text(text, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
        }
    }
}

@Composable
fun GhostButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, SurfaceElevatedDark),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = BodyTextLight,
            disabledContentColor = MutedTextGray
        )
    ) {
        Text(text, fontWeight = FontWeight.Medium, fontSize = 15.sp)
    }
}

@Composable
fun Card(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    androidx.compose.material3.Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = SurfaceCardDark,
        border = BorderStroke(1.dp, SurfaceElevatedDark)
    ) {
        content()
    }
}

@Composable
fun LabeledField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    singleLine: Boolean = true
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(label, fontSize = 13.sp, color = MutedTextGray)
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = singleLine,
            placeholder = { Text(placeholder, color = MutedTextGray) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BinanceYellow,
                unfocusedBorderColor = SurfaceElevatedDark,
                focusedTextColor = BodyTextLight,
                unfocusedTextColor = BodyTextLight,
                cursorColor = BinanceYellow
            )
        )
    }
}

@Composable
fun PhaseChip(phase: RecipientPhase) {
    val (color, background) = when (phase) {
        RecipientPhase.SUCCESS -> TradingUp to TradingUp.copy(alpha = 0.15f)
        RecipientPhase.FAILED -> TradingDown to TradingDown.copy(alpha = 0.15f)
        RecipientPhase.IDLE -> MutedTextGray to SurfaceElevatedDark
        else -> BinanceYellow to BinanceYellow.copy(alpha = 0.15f)
    }
    Row(
        modifier = Modifier
            .background(background, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(phase.label, color = color, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun StatusPill(
    label: String,
    modifier: Modifier = Modifier,
    highlight: Boolean = false
) {
    Row(
        modifier = modifier
            .background(if (highlight) BinanceYellow else SurfaceElevatedDark, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            label,
            color = if (highlight) OnPrimaryDark else BodyTextLight,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun EmptyState(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(title, color = BodyTextLight, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))
        Text(subtitle, color = MutedTextGray, fontSize = 13.sp, textAlign = TextAlign.Center)
    }
}

@Composable
fun ErrorBanner(
    message: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(TradingDown.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(message, color = TradingDown, fontSize = 13.sp)
    }
}
