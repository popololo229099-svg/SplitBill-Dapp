package com.splitbill.android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.splitbill.android.data.SplitRecord
import com.splitbill.android.data.StellarService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class EventLogViewModel : ViewModel() {

    data class UiState(
        val totalSplits: String? = null,
        val records: List<SplitRecord> = emptyList(),
        val isLoading: Boolean = false,
        val error: String? = null
    )

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            runCatching {
                val total = StellarService.getTotalSplits()
                val records = StellarService.getSplits(0, 50)
                Pair(total, records)
            }.onSuccess { (total, records) ->
                _state.value = _state.value.copy(totalSplits = total.toString(), records = records, isLoading = false)
            }.onFailure { e ->
                _state.value = _state.value.copy(isLoading = false, error = e.message ?: "Failed to load on-chain log")
            }
        }
    }
}
