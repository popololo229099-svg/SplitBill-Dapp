package com.splitbill.android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soneso.stellar.sdk.KeyPair
import com.splitbill.android.analytics.MixpanelTracker
import com.splitbill.android.data.StellarService
import com.splitbill.android.data.WalletRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WalletViewModel(
    private val repository: WalletRepository,
    private val mixpanel: MixpanelTracker
) : ViewModel() {

    data class UiState(
        val publicKey: String? = null,
        val secretSeed: String? = null,
        val balance: String = "0",
        val isConnecting: Boolean = false,
        val isImporting: Boolean = false,
        val error: String? = null
    )

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val secret = repository.getSecret() ?: return@launch
            val keypair = runCatching { KeyPair.fromSecretSeed(secret) }.getOrNull() ?: return@launch
            mixpanel.identify(keypair.getAccountId())
            mixpanel.track("wallet_connected", mapOf("wallet_id" to "android_self_custody"))
            _state.value = _state.value.copy(publicKey = keypair.getAccountId(), secretSeed = secret)
            refreshBalance()
        }
    }

    fun createWallet() {
        if (_state.value.isConnecting) return
        viewModelScope.launch {
            _state.value = _state.value.copy(isConnecting = true, error = null)
            runCatching {
                val keypair = KeyPair.random()
                val seed = String(keypair.getSecretSeed()!!)
                repository.setSecret(seed)
                mixpanel.identify(keypair.getAccountId())
                mixpanel.track("wallet_connected", mapOf("wallet_id" to "android_self_custody"))
                _state.value = _state.value.copy(publicKey = keypair.getAccountId(), secretSeed = seed, isConnecting = false)
                refreshBalance()
            }.onFailure { e ->
                _state.value = _state.value.copy(isConnecting = false, error = e.message ?: "Failed to create wallet")
            }
        }
    }

    fun importWallet(secret: String) {
        if (_state.value.isImporting) return
        viewModelScope.launch {
            _state.value = _state.value.copy(isImporting = true, error = null)
            runCatching {
                val keypair = KeyPair.fromSecretSeed(secret)
                repository.setSecret(secret)
                mixpanel.identify(keypair.getAccountId())
                mixpanel.track("wallet_connected", mapOf("wallet_id" to "android_self_custody"))
                _state.value = _state.value.copy(publicKey = keypair.getAccountId(), secretSeed = secret, isImporting = false)
                refreshBalance()
            }.onFailure { e ->
                _state.value = _state.value.copy(isImporting = false, error = e.message ?: "Invalid secret seed")
            }
        }
    }

    fun disconnect() {
        repository.clear()
        mixpanel.reset()
        _state.value = UiState()
    }

    fun refreshBalance() {
        val publicKey = _state.value.publicKey ?: return
        viewModelScope.launch {
            _state.value = _state.value.copy(balance = StellarService.getBalance(publicKey))
        }
    }
}
