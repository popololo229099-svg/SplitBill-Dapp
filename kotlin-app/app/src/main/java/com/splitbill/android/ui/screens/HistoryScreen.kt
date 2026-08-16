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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.splitbill.android.data.TransactionDto
import com.splitbill.android.ui.components.Card
import com.splitbill.android.ui.components.EmptyState
import com.splitbill.android.ui.components.ErrorBanner
import com.splitbill.android.ui.components.GhostButton
import com.splitbill.android.ui.components.StatusPill
import com.splitbill.android.ui.theme.BodyTextLight
import com.splitbill.android.ui.theme.MutedTextGray
import com.splitbill.android.ui.theme.TradingDown
import com.splitbill.android.ui.theme.TradingUp
import com.splitbill.android.viewmodel.HistoryViewModel

@Composable
fun HistoryScreen(historyViewModel: HistoryViewModel) {
    val state by historyViewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        historyViewModel.load()
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = BodyTextLight)
        Spacer(Modifier.height(12.dp))

        state.error?.let { ErrorBanner(it, Modifier.padding(bottom = 12.dp)) }

        if (state.transactions.isEmpty() && !state.isLoading) {
            EmptyState(
                title = "No splits yet",
                subtitle = "Completed splits will appear here.",
                modifier = Modifier.weight(1f)
            )
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(state.transactions, key = { it.id ?: it.txHash ?: it.hashCode() }) { transaction ->
                    TransactionRow(transaction)
                }
                item {
                    GhostButton(text = "Refresh", onClick = { historyViewModel.load() })
                }
            }
        }
    }
}

@Composable
private fun TransactionRow(transaction: TransactionDto) {
    val success = transaction.status == "success"
    Card {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "${transaction.amount} XLM",
                    color = BodyTextLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                StatusPill(
                    label = if (success) "Success" else (transaction.status ?: "Unknown"),
                    highlight = success
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(
                "To ${transaction.recipientAddress ?: "unknown"}",
                color = MutedTextGray,
                fontSize = 12.sp,
                maxLines = 1
            )
            Text(
                "Tx ${transaction.txHash ?: "pending"}",
                color = MutedTextGray,
                fontSize = 11.sp,
                maxLines = 1
            )
            transaction.createdAt?.let {
                Text(it, color = MutedTextGray, fontSize = 11.sp)
            }
        }
    }
}
