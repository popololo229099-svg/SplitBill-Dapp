package com.splitbill.android.data

import com.soneso.stellar.sdk.Account
import com.soneso.stellar.sdk.Address
import com.soneso.stellar.sdk.Asset
import com.soneso.stellar.sdk.Auth
import com.soneso.stellar.sdk.InvokeHostFunctionOperation
import com.soneso.stellar.sdk.KeyPair
import com.soneso.stellar.sdk.Network
import com.soneso.stellar.sdk.PaymentOperation
import com.soneso.stellar.sdk.TransactionBuilder
import com.soneso.stellar.sdk.horizon.HorizonServer
import com.soneso.stellar.sdk.rpc.SorobanServer
import com.soneso.stellar.sdk.scval.Scv
import com.soneso.stellar.sdk.xdr.SCValXdr
import com.soneso.stellar.sdk.xdr.SorobanAuthorizationEntryXdr
import com.soneso.stellar.sdk.xdr.SorobanCredentialsXdr
import com.soneso.stellar.sdk.xdr.XdrReader
import com.splitbill.android.Config
import java.util.Base64

object StellarService {

    private const val BASE_FEE = 100L
    private const val DUMMY_ACCOUNT_ID = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"

    suspend fun getBalance(accountId: String): String {
        val server = HorizonServer(Config.STELLAR_HORIZON)
        return try {
            val account = server.accounts().account(accountId)
            val native = account.balances.firstOrNull { it.assetType == "native" }
            native?.balance ?: "0"
        } catch (e: Exception) {
            "0"
        } finally {
            server.close()
        }
    }

    suspend fun sendPayment(keypair: KeyPair, destination: String, amount: String): String {
        val server = HorizonServer(Config.STELLAR_HORIZON)
        try {
            val sourceAccount = server.loadAccount(keypair.getAccountId())
            val transaction = TransactionBuilder(sourceAccount, Network.TESTNET)
                .setBaseFee(BASE_FEE)
                .addOperation(
                    PaymentOperation(destination = destination, amount = amount, asset = Asset.create("native"))
                )
                .build()
            transaction.sign(keypair)
            server.submitTransaction(transaction.toEnvelopeXdrBase64())
            return transaction.hashHex()
        } finally {
            server.close()
        }
    }

    suspend fun recordSplit(keypair: KeyPair, recipient: String, amount: String): String {
        val server = SorobanServer(Config.STELLAR_RPC)
        try {
            val invokeOp = InvokeHostFunctionOperation.invokeContractFunction(
                contractAddress = Config.STELLAR_CONTRACT,
                functionName = "record_split",
                parameters = listOf(
                    Address(keypair.getAccountId()).toSCVal(),
                    Address(recipient).toSCVal(),
                    Scv.toString(amount)
                )
            )
            val sourceAccount = server.getAccount(keypair.getAccountId())
            val transaction = TransactionBuilder(sourceAccount, Network.TESTNET)
                .setBaseFee(BASE_FEE)
                .addOperation(invokeOp)
                .build()

            val simulate = server.simulateTransaction(transaction)
            check(simulate.error == null) { "Simulation failed: ${simulate.error}" }

            val prepared = server.prepareTransaction(transaction, simulate)
            val op = prepared.operations.first() as InvokeHostFunctionOperation

            val validUntil = (simulate.latestLedger ?: server.getLatestLedger().sequence) + 100
            val signedAuth = signInvokerAuth(op, keypair, validUntil)

            val finalTransaction = if (signedAuth == null) {
                prepared
            } else {
                val account = Account(prepared.sourceAccount, prepared.sequenceNumber - 1)
                TransactionBuilder(account, Network.TESTNET)
                    .setBaseFee(BASE_FEE)
                    .addOperation(op.copy(auth = signedAuth))
                    .setSorobanData(prepared.sorobanData!!)
                    .build()
            }

            finalTransaction.sign(keypair)
            val response = server.sendTransaction(finalTransaction)
            return response.hash ?: throw IllegalStateException("Soroban send returned no hash")
        } finally {
            server.close()
        }
    }

    suspend fun getTotalSplits(): ULong {
        val retval = simulateRead("get_total_splits", emptyList())
        return Scv.fromUint64(retval)
    }

    suspend fun getSplits(start: Long, limit: Long): List<SplitRecord> {
        val retval = simulateRead(
            "get_splits",
            listOf(Scv.toUint64(start.toULong()), Scv.toUint32(limit.toUInt()))
        )
        return Scv.fromVec(retval).map { parseSplitRecord(it) }
    }

    private suspend fun simulateRead(functionName: String, args: List<SCValXdr>): SCValXdr {
        val server = SorobanServer(Config.STELLAR_RPC)
        try {
            val invokeOp = InvokeHostFunctionOperation.invokeContractFunction(
                contractAddress = Config.STELLAR_CONTRACT,
                functionName = functionName,
                parameters = args
            )
            val dummyAccount = Account(DUMMY_ACCOUNT_ID, 0L)
            val transaction = TransactionBuilder(dummyAccount, Network.TESTNET)
                .setBaseFee(BASE_FEE)
                .addOperation(invokeOp)
                .build()
            val simulate = server.simulateTransaction(transaction)
            check(simulate.error == null) { "Simulation failed: ${simulate.error}" }
            val xdr = simulate.results?.firstOrNull()?.xdr ?: throw IllegalStateException("Empty simulation result")
            val bytes = Base64.getDecoder().decode(xdr)
            return SCValXdr.decode(XdrReader(bytes))
        } finally {
            server.close()
        }
    }

    private suspend fun signInvokerAuth(
        op: InvokeHostFunctionOperation,
        keypair: KeyPair,
        validUntil: Long
    ): List<SorobanAuthorizationEntryXdr>? {
        var modified = false
        val signed = op.auth.map { entry ->
            val address = when (val credentials = entry.credentials) {
                is SorobanCredentialsXdr.Address -> credentials.value.address
                is SorobanCredentialsXdr.AddressV2 -> credentials.value.address
                else -> null
            }
            val belongsToInvoker = address != null &&
                runCatching { Address.fromSCAddress(address).toString() == keypair.getAccountId() }.getOrDefault(false)
            if (belongsToInvoker) {
                modified = true
                Auth.authorizeEntry(entry, keypair, validUntil, Network.TESTNET, Auth.AuthOptions())
            } else {
                entry
            }
        }
        return if (modified) signed else null
    }

    private fun parseSplitRecord(scVal: SCValXdr): SplitRecord {
        val map = Scv.fromMap(scVal)
        fun field(key: String): SCValXdr? =
            map.entries.firstOrNull { (k, _) -> runCatching { Scv.fromSymbol(k) == key }.getOrDefault(false) }?.value
        return SplitRecord(
            id = field("id")?.let { runCatching { Scv.fromUint64(it) }.getOrDefault(0UL) } ?: 0UL,
            sender = field("sender")?.let { runCatching { addressString(it) }.getOrDefault("") } ?: "",
            recipient = field("recipient")?.let { runCatching { addressString(it) }.getOrDefault("") } ?: "",
            amount = field("amount")?.let { runCatching { Scv.fromString(it) }.getOrDefault("") } ?: "",
            timestamp = field("timestamp")?.let { runCatching { Scv.fromUint64(it) }.getOrDefault(0UL) } ?: 0UL
        )
    }

    private fun addressString(scVal: SCValXdr): String =
        Address.fromSCAddress(Scv.fromAddress(scVal)).toString()
}
