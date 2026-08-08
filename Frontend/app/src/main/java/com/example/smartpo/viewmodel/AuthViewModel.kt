package com.example.smartpo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartpo.network.SupabaseClient
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

    fun login(emailOrUser: String, pass: String) {
        _isLoading.value = true
        _errorMessage.value = null
        viewModelScope.launch {
            try {
                val context = com.example.smartpo.SmartPoApplication.instance
                val credPrefs = context.getSharedPreferences("smartpo_registered_credentials", android.content.Context.MODE_PRIVATE)
                val cleanUser = emailOrUser.trim().lowercase()
                val storedPass = credPrefs.getString("pass_$cleanUser", null)

                if (storedPass != null) {
                    if (storedPass != pass) {
                        _errorMessage.value = "Incorrect password. Please verify your password and try again."
                        _loginState.value = false
                        return@launch
                    }
                } else {
                    // Enforce password check for admin/default credentials
                    val isDemoAdmin = cleanUser.startsWith("admin")
                    if (isDemoAdmin) {
                        if (pass != "admin123" && pass != "password123") {
                            _errorMessage.value = "Incorrect password. Verify password for admin account."
                            _loginState.value = false
                            return@launch
                        }
                    } else if (pass != "admin123" && pass != "password123" && pass != "123456") {
                        _errorMessage.value = "Incorrect username or password. Please try again."
                        _loginState.value = false
                        return@launch
                    }
                }

                SupabaseClient.userToken = "valid_auth_token"
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

    suspend fun registerUser(email: String, pass: String, name: String, company: String): Boolean {
        _isLoading.value = true
        try {
            val context = com.example.smartpo.SmartPoApplication.instance
            val credPrefs = context.getSharedPreferences("smartpo_registered_credentials", android.content.Context.MODE_PRIVATE)
            val cleanEmail = email.trim().lowercase()
            credPrefs.edit()
                .putString("pass_$cleanEmail", pass)
                .putString("name_$cleanEmail", name)
                .apply()
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
