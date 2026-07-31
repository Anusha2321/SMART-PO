package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel

@Composable
fun NewOrderStep2Screen(
    customerName: String,
    customerEmail: String,
    poNumber: String,
    onNavigateToStep3: () -> Unit,
    onNavigateBack: () -> Unit,
    onNavigateToAi: () -> Unit = {},
    orderViewModel: OrderViewModel,
    catalogViewModel: CatalogViewModel
) {
    // This is a placeholder screen fixed to compile without Supabase.
    // The active screen is OrderStep2Screen.
    Box(modifier = Modifier.fillMaxSize()) { 
        Text("NewOrderStep2Screen (Fixed)", modifier = Modifier.align(Alignment.Center)) 
        
        FloatingActionButton(
            onClick = onNavigateToAi,
            containerColor = Color(0xFF1A3C6E),
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp)
        ) {
            Icon(
                Icons.Default.AutoAwesome,
                contentDescription = "Use AI to find items",
                tint = Color.White
            )
        }
    }
}
