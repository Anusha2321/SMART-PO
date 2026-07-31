package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.example.smartpo.viewmodel.AuthViewModel

@Composable
fun SignUpStep3Screen(
    email: String,
    passwordHash: String,
    name: String,
    company: String,
    phone: String,
    onSignUpComplete: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: AuthViewModel
) {
    // This is a placeholder screen fixed to compile without Supabase and use SHA-256 logic (AuthViewModel handles it)
    Box { Text("SignUpStep3Screen (Fixed)") }
}
