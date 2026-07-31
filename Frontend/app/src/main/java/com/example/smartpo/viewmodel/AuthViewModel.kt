package com.example.smartpo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartpo.network.SupabaseClient
import com.google.gson.JsonObject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn

    private val _loginState = MutableStateFlow<Boolean?>(null)
    val loginState: StateFlow<Boolean?> = _loginState

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    fun setError(msg: String) {
        _errorMessage.value = msg
    }

    fun login(email: String, password: String) {
        _isLoading.value = true
        _errorMessage.value = null
        viewModelScope.launch {
            try {
                // In a production app, call Supabase Auth API
                // For direct bypass / local check:
                SupabaseClient.userToken = "dummy_token"
                _isLoggedIn.value = true
                _loginState.value = true
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Authentication failed"
                _loginState.value = false
            } finally {
                _isLoading.value = false
            }
        }
    }

    suspend fun registerUser(email: String, password: String, name: String, company: String): Boolean {
        _isLoading.value = true
        try {
            // Post registration logic to backend / Supabase
            return true
        } catch (e: Exception) {
            return false
        } finally {
            _isLoading.value = false
        }
    }

    fun logout() {
        SupabaseClient.userToken = null
        _isLoggedIn.value = false
        _loginState.value = null
    }
}
