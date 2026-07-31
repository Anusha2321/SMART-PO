package com.example.smartpo.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class HomeViewModel : ViewModel() {
    private val _totalItems = MutableStateFlow(4)
    val totalItems: StateFlow<Int> = _totalItems

    private val _totalOrders = MutableStateFlow(0)
    val totalOrders: StateFlow<Int> = _totalOrders

    fun loadStats() {
        // Load stats from Supabase/database
    }
}
