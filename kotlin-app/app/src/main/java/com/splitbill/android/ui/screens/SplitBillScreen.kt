package com.splitbill.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.splitbill.android.R
import com.splitbill.android.data.Recipient
import com.splitbill.android.ui.components.Card
import com.splitbill.android.ui.components.ErrorBanner
import com.splitbill.android.ui.components.LabeledField
import com.splitbill.android.ui.components.PhaseChip
import com.splitbill.android.ui.components.PrimaryButton
import com.splitbill.android.ui.components.StatusPill
import com.splitbill.android.ui.theme.BodyTextLight
import com.splitbill.android.ui.theme.MutedTextGray
import com.splitbill.android.viewmodel.SplitBillViewModel
import com.splitbill.android.viewmodel.WalletViewModel

@Composable
fun SplitBillScreen(
    splitBillViewModel: SplitBillViewModel,
    walletViewModel: WalletViewModel
) {
    val state by splitBillViewModel.state.collectAsStateWithLifecycle()
    val wallet by walletViewModel.state.collectAsStateWithLifecycle()
    var showAddRecipient by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Split Bill", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = BodyTextLight)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = { walletViewModel.disconnect() }) {
                Text("Disconnect", color = MutedTextGray, fontSize = 12.sp)
            }
        }

        wallet.publicKey?.let { publicKey ->
            Card {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Balance", fontSize = 12.sp, color = MutedTextGray)
                        Text("${wallet.balance} XLM", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BodyTextLight)
                    }
                    StatusPill(label = publicKey.take(8) + "...", highlight = true)
                }
            }
        }

        LabeledField(
            value = state.totalAmount,
            onValueChange = { splitBillViewModel.setTotal(it) },
            label = "Total amount (XLM)",
            placeholder = "0.00"
        )

        if (state.recipients.isNotEmpty()) {
            Text("Recipients (${state.recipients.size})", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = BodyTextLight)
            state.recipients.forEach { recipient ->
                RecipientRow(recipient, state.isSplitting, onRemove = {
                    splitBillViewModel.removeRecipient(recipient.id)
                })
            }
        } else {
            Text(
                "No recipients yet. Add people to split with.",
                color = MutedTextGray,
                fontSize = 13.sp,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
        }

        PrimaryButton("Add recipient", onClick = { showAddRecipient = true }, enabled = !state.isSplitting)

        if (state.splitAmount.isNotBlank()) {
            Card {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Each pays", color = MutedTextGray, fontSize = 13.sp)
                    Text("${state.splitAmount} XLM", color = BodyTextLight, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        if (state.recipients.any { it.error != null }) {
            state.recipients.filter { it.error != null }.forEach { r ->
                ErrorBanner("${r.name}: ${r.error?.label}", Modifier.padding(bottom = 4.dp))
            }
        }

        wallet.secretSeed?.let {
            PrimaryButton(
                text = if (state.isSplitting) "Splitting..." else "Review & Confirm",
                onClick = { splitBillViewModel.startSplit(it) },
                loading = state.isSplitting,
                enabled = state.totalAmount.isNotBlank() && state.recipients.isNotEmpty()
            )
        }
    }

    if (showAddRecipient) {
        AddRecipientDialog(
            onDismiss = { showAddRecipient = false },
            onAdd = { name, address ->
                splitBillViewModel.addRecipient(name, address)
                showAddRecipient = false
            }
        )
    }
}

@Composable
private fun RecipientRow(
    recipient: Recipient,
    isSplitting: Boolean,
    onRemove: () -> Unit
) {
    Card {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(recipient.name, color = BodyTextLight, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                Text(recipient.address, color = MutedTextGray, fontSize = 12.sp, maxLines = 1)
            }
            Spacer(Modifier.height(4.dp))
            if (recipient.amount.isNotBlank()) {
                Text("${recipient.amount} XLM", color = BodyTextLight, fontSize = 13.sp)
            }
            Spacer(Modifier.weight(0f))
            PhaseChip(recipient.phase)
            IconButton(onClick = onRemove, enabled = !isSplitting) {
                Icon(
                    imageVector = ImageVector.vectorResource(R.drawable.ic_close),
                    contentDescription = "Remove ${recipient.name}",
                    tint = MutedTextGray
                )
            }
        }
    }
}

@Composable
private fun AddRecipientDialog(
    onDismiss: () -> Unit,
    onAdd: (String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    val valid = name.isNotBlank() && address.startsWith("G") && address.length >= 50

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        title = { Text("Add recipient", color = BodyTextLight) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                LabeledField(name, { name = it }, label = "Name", placeholder = "Alice")
                LabeledField(address, { address = it }, label = "Stellar address (G...)", placeholder = "G...")
            }
        },
        confirmButton = {
            TextButton(onClick = { onAdd(name.trim(), address.trim()) }, enabled = valid) {
                Text("Add", color = if (valid) Color(0xFFFCD535) else MutedTextGray)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = MutedTextGray)
            }
        }
    )
}
