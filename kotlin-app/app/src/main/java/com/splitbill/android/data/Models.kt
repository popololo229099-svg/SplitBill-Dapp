package com.splitbill.android.data

enum class RecipientPhase(val label: String) {
    IDLE("Pending"),
    BUILDING("Building"),
    SIGNING("Signing"),
    SUBMITTING("Submitting"),
    RECORDING("Recording"),
    SUCCESS("Success"),
    FAILED("Failed")
}

enum class SplitErrorType(val label: String) {
    INSUFFICIENT_BALANCE("Insufficient balance"),
    TRANSACTION_REJECTED("Transaction rejected"),
    ACCOUNT_NOT_FOUND("Account not found"),
    TIMEOUT("Transaction timed out"),
    UNKNOWN("Unknown error")
}

data class Recipient(
    val id: Int,
    val name: String,
    val address: String,
    val amount: String = "",
    val phase: RecipientPhase = RecipientPhase.IDLE,
    val txHash: String? = null,
    val error: SplitErrorType? = null,
    val errorMessage: String? = null
)

data class SplitRecord(
    val id: ULong,
    val sender: String,
    val recipient: String,
    val amount: String,
    val timestamp: ULong
)

data class TransactionDto(
    val id: Long? = null,
    val senderAddress: String? = null,
    val recipientAddress: String? = null,
    val amount: String? = null,
    val txHash: String? = null,
    val status: String? = null,
    val createdAt: String? = null
)

data class RecordTransactionRequest(
    val senderAddress: String,
    val recipientAddress: String,
    val amount: String,
    val txHash: String? = null,
    val status: String? = null
)
