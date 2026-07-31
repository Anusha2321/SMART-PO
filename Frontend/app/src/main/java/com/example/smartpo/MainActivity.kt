package com.example.smartpo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.smartpo.ui.navigation.AppNavigation
import com.example.smartpo.ui.theme.SmartPOTheme
import com.example.smartpo.viewmodel.AuthViewModel
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel
import com.example.smartpo.viewmodel.HomeViewModel

class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val catalogViewModel: CatalogViewModel by viewModels()
    private val orderViewModel: OrderViewModel by viewModels()
    private val homeViewModel: HomeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        com.example.smartpo.util.LanguageManager.init(applicationContext)
        setContent {
            SmartPOTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(
                        authViewModel = authViewModel,
                        catalogViewModel = catalogViewModel,
                        orderViewModel = orderViewModel,
                        homeViewModel = homeViewModel
                    )
                }
            }
        }
    }
}
