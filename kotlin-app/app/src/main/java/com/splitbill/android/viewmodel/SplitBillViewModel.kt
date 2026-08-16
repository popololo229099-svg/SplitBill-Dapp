package com.splitbill.android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soneso.stellar.sdk.KeyPair
import com.splitbill.android.analytics.MixpanelTracker
import com.splitbill.android.data.ApiClient
import com.splitbill.android.data.Recipient
import com.splitbill.android.data.RecipientPhase
import com.splitbill.android.data.RecordTransactionRequest
import com.splitbill.android.data.SplitErrorType
import com.splitbill.android.data.StellarService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.Locale

class SplitBillViewModel(
    private val mixpanel: MixpanelTracker
) : ViewModel() {

    data class UiState(
        val totalAmount: String = "",
        val recipients: List<Recipient> = emptyList(),
        val splitAmount: String = "",
        val isSplitting: Boolean = false
    )

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state.asStateFlow()

    private var nextRecipientId = 1

    fun setTotal(total: String) {
        _state.value = _state.value.copy(totalAmount = total, splitAmount = computeSplit(total))
    }

    fun addRecipient(name: String, address: String) {
        val recipients = _state.value.recipients + Recipient(id = nextRecipientId++, name = name, address = address)
        _state.value = _state.value.copy(recipients = recipients)
    }

    fun removeRecipient(id: Int) {
        val recipients = _state.value.recipients.filterNot { it.id == id }
        _state.value = _state.value.copy(recipients = recipients)
    }

    fun startSplit(secretSeed: String) {
        val total = _state.value.totalAmount.toBigDecimalOrNull()
        val recipients = _state.value.recipients
        if (total == null || recipients.isEmpty() || _state.value.isSplitting) return

        val splitAmount = computeSplit(_state.value.totalAmount)
        _state.value = _state.value.copy(isSplitting = true, splitAmount = splitAmount)

        mixpanel.track(
            "bill_split_initiated",
            mapOf(
                "total_amount" to total.toDouble(),
                "recipient_count" to recipients.size,
                "split_amount" to (splitAmount.toBigDecimalOrNull()?.toDouble() ?: 0.0)
            )
        )

        viewModelScope.launch {
            val keypair = runCatching { KeyPair.fromSecretSeed(secretSeed) }.getOrNull()
            if (keypair == null) {
                _state.value = _state.value.copy(isSplitting = false)
                return@launch
            }

            val seeded = recipients.map { it.copy(amount = splitAmount, phase = RecipientPhase.BUILDING) }
            _state.value = _state.value.copy(recipients = seeded)

            val results = seeded.map { recipient -> processRecipient(keypair, recipient) }
            val succeeded = results.count { it.phase == RecipientPhase.SUCCESS }
            val failed = results.count { it.phase == RecipientPhase.FAILED }
            val sender = keypair.getAccountId()

            results.forEach { recipient ->
                val txHash = recipient.txHash
                if (txHash != null) {
                    runCatching {
                        ApiClient.api.recordTransaction(
                            RecordTransactionRequest(
                                senderAddress = sender,
                                recipientAddress = recipient.address,
                                amount = recipient.amount,
                                txHash = txHash,
                                status = if (recipient.phase == RecipientPhase.SUCCESS) "success" else "failed"
                            )
                        )
                    }
                }
            }

            if (failed == 0) {
                mixpanel.track(
                    "bill_split_completed",
                    mapOf(
                        "total_amount" to total.toDouble(),
                        "recipient_count" to recipients.size,
                        "succeeded_count" to succeeded
                    )
                )
            } else {
                mixpanel.track(
                    "bill_split_failed",
                    mapOf(
                        "total_amount" to total.toDouble(),
                        "recipient_count" to recipients.size,
                        "succeeded_count" to succeeded,
                        "failed_count" to failed
                    )
                )
            }

            _state.value = _state.value.copy(recipients = results, isSplitting = false)
        }
    }

    fun reset() {
        nextRecipientId = 1
        _state.value = UiState()
    }

    private suspend fun processRecipient(keypair: KeyPair, recipient: Recipient): Recipient {
        return try {
            val txHash = StellarService.sendPayment(keypair, recipient.address, recipient.amount)
            val recording = recipient.copy(phase = RecipientPhase.RECORDING, txHash = txHash)
            replaceRecipient(recording)
            runCatching { StellarService.recordSplit(keypair, recipient.address, recipient.amount) }
            recipient.copy(phase = RecipientPhase.SUCCESS, txHash = txHash)
        } catch (e: Exception) {
            recipient.copy(
                phase = RecipientPhase.FAILED,
                error = classifyError(e),
                errorMessage = e.message
            )
        }
    }

    private fun replaceRecipient(updated: Recipient) {
        _state.value = _state.value.copy(
            recipients = _state.value.recipients.map { if (it.id == updated.id) updated else it }
        )
    }

    private fun computeSplit(total: String): String {
        val totalValue = total.toBigDecimalOrNull() ?: return ""
        val count = _state.value.recipients.size
        if (count == 0) return ""
        return totalValue.divide(count.toBigDecimal(), 7, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString()
    }

    private fun classifyError(e: Exception): SplitErrorType {
        val message = (e.message ?: "").lowercase(Locale.ROOT)
        return when {
            message.contains("underfunded") || message.contains("insufficient") -> SplitErrorType.INSUFFICIENT_BALANCE
            message.contains("no destination") || message.contains("account not found") ||
                message.contains("not found") || message.contains("no such account") -> SplitErrorType.ACCOUNT_NOT_FOUND
            message.contains("timeout") || message.contains("timed out") -> SplitErrorType.TIMEOUT
            message.contains("reject") || message.contains("failed") -> SplitErrorType.TRANSACTION_REJECTED
            else -> SplitErrorType.UNKNOWN
        }
    }
}
