package com.splitbill.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.splitbill.android.ui.components.Card
import com.splitbill.android.ui.components.ErrorBanner
import com.splitbill.android.ui.components.GhostButton
import com.splitbill.android.ui.components.LabeledField
import com.splitbill.android.ui.components.PrimaryButton
import com.splitbill.android.ui.components.StatusPill
import com.splitbill.android.ui.theme.BinanceYellow
import com.splitbill.android.ui.theme.BodyTextLight
import com.splitbill.android.ui.theme.MutedTextGray
import com.splitbill.android.viewmodel.WalletViewModel

@Composable
fun LandingScreen(
    walletViewModel: WalletViewModel,
    onConnected: () -> Unit
) {
    val state by walletViewModel.state.collectAsStateWithLifecycle()
    var showImport by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(Modifier.height(16.dp))
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "SplitBill",
                color = BinanceYellow,
                fontSize = 34.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "Split XLM payments across friends",
                color = MutedTextGray,
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )
        }

        Spacer(Modifier.height(8.dp))

        state.error?.let { ErrorBanner(it) }

        Card {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Connect your Stellar wallet", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = BodyTextLight)
                Spacer(Modifier.height(4.dp))
                Text(
                    "Your wallet is self-custodial. The secret seed is generated on this device, encrypted with your Android Keystore, and never leaves the app.",
                    fontSize = 13.sp,
                    color = MutedTextGray,
                    lineHeight = 18.sp
                )
            }
        }

        Card {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Create a new wallet", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = BodyTextLight)
                Spacer(Modifier.height(8.dp))
                PrimaryButton("Create wallet", onClick = { walletViewModel.createWallet() }, loading = state.isConnecting)
            }
        }

        Card {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Already have a wallet?", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = BodyTextLight)
                Spacer(Modifier.height(8.dp))
                GhostButton("Import secret seed", onClick = { showImport = true })
            }
        }

        Spacer(Modifier.height(8.dp))
        Text(
            "Stellar Testnet only",
            fontSize = 12.sp,
            color = MutedTextGray,
            textAlign = TextAlign.Center
        )
    }

    if (showImport) {
        AlertDialog(
            onDismissRequest = { showImport = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = { Text("Import secret seed", color = BodyTextLight) },
            text = {
                ImportSeedForm(walletViewModel, onDone = { showImport = false })
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showImport = false }) {
                    Text("Cancel", color = MutedTextGray)
                }
            }
        )
    }
}

@Composable
private fun ImportSeedForm(walletViewModel: WalletViewModel, onDone: () -> Unit) {
    var seed by remember { mutableStateOf("") }
    val state by walletViewModel.state.collectAsStateWithLifecycle()

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        LabeledField(
            value = seed,
            onValueChange = { seed = it },
            label = "Secret seed (S...)",
            placeholder = "S...",
            singleLine = false
        )
        state.error?.let { Text(it, color = Color(0xFFF6465D), fontSize = 12.sp) }
        PrimaryButton(
            text = "Import",
            onClick = {
                walletViewModel.importWallet(seed.trim())
                if (state.publicKey != null) onDone()
            },
            loading = state.isImporting
        )
    }
}
