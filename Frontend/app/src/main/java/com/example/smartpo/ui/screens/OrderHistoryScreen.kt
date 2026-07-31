package com.example.smartpo.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smartpo.util.ExportHelper
import com.example.smartpo.viewmodel.OrderViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(
    viewModel: OrderViewModel,
    onOrderClick: (String) -> Unit
) {
    val orders by viewModel.getAllOrders().collectAsState(initial = emptyList())
    val dateFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Order History") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            items(orders) { order ->
                ListItem(
                    headlineContent = { Text("PO: ${order.poNumber}", fontWeight = FontWeight.SemiBold) },
                    supportingContent = { 
                        Column {
                            Text("Customer: ${order.customerName}")
                            Text("Company: ${order.company_name.ifBlank { "SmartPO Industrial Corp" }}", style = MaterialTheme.typography.bodySmall)
                            Text(dateFormat.format(Date(order.dateMillis)), style = MaterialTheme.typography.labelSmall)
                        }
                    },
                    trailingContent = { Text(ExportHelper.formatRupee(order.total_amount), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) },
                    modifier = Modifier.clickable { onOrderClick(order.id) }
                )
                Divider()
            }
        }
    }
}
