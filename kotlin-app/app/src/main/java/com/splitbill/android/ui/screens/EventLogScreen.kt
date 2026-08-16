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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.splitbill.android.data.SplitRecord
import com.splitbill.android.ui.components.Card
import com.splitbill.android.ui.components.EmptyState
import com.splitbill.android.ui.components.ErrorBanner
import com.splitbill.android.ui.components.GhostButton
import com.splitbill.android.ui.components.StatusPill
import com.splitbill.android.ui.theme.BinanceYellow
import com.splitbill.android.ui.theme.BodyTextLight
import com.splitbill.android.ui.theme.MutedTextGray
import com.splitbill.android.viewmodel.EventLogViewModel
import kotlinx.coroutines.delay

@Composable
fun EventLogScreen(eventLogViewModel: EventLogViewModel) {
    val state by eventLogViewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        eventLogViewModel.refresh()
        while (true) {
            delay(30_000)
            eventLogViewModel.refresh()
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("On-Chain Log", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = BodyTextLight)
        Spacer(Modifier.height(12.dp))

        state.error?.let { ErrorBanner(it, Modifier.padding(bottom = 12.dp)) }

        Card {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Total splits recorded", color = MutedTextGray, fontSize = 13.sp)
                Text(
                    state.totalSplits ?: "—",
                    color = BinanceYellow,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        if (state.records.isEmpty() && !state.isLoading) {
            EmptyState(
                title = "No on-chain splits yet",
                subtitle = "Splits recorded by the smart contract will appear here.",
                modifier = Modifier.weight(1f)
            )
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(state.records, key = { it.id }) { record ->
                    SplitRecordRow(record)
                }
                item {
                    GhostButton(text = "Refresh", onClick = { eventLogViewModel.refresh() })
                }
            }
        }
    }
}

@Composable
private fun SplitRecordRow(record: SplitRecord) {
    Card {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "${record.amount} XLM",
                    color = BodyTextLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                StatusPill(label = "#${record.id}", highlight = true)
            }
            Spacer(Modifier.height(6.dp))
            Text("From ${record.sender}", color = MutedTextGray, fontSize = 11.sp, maxLines = 1)
            Text("To ${record.recipient}", color = MutedTextGray, fontSize = 11.sp, maxLines = 1)
            Text(
                "Ledger sequence ${record.timestamp}",
                color = MutedTextGray,
                fontSize = 11.sp
            )
        }
    }
}
