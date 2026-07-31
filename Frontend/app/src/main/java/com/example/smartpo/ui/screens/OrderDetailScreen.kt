package com.example.smartpo.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartpo.data.database.ItemEntity
import com.example.smartpo.data.database.OrderEntity
import com.example.smartpo.data.database.OrderItemEntity
import com.example.smartpo.util.ExportHelper
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    orderId: String,
    orderViewModel: OrderViewModel,
    catalogViewModel: CatalogViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    var order by remember { mutableStateOf<OrderEntity?>(null) }
    var orderItems by remember { mutableStateOf<List<OrderItemEntity>>(emptyList()) }

    // Dialog edit states
    var showEditDialog by remember { mutableStateOf(false) }
    var editPoNumber by remember { mutableStateOf("") }
    var editCustomerName by remember { mutableStateOf("") }
    var editCompanyName by remember { mutableStateOf("") }
    var editTotalAmount by remember { mutableStateOf("") }

    // Delete confirmation state
    var showDeleteConfirm by remember { mutableStateOf(false) }

    LaunchedEffect(orderId) {
        order = orderViewModel.getOrderById(orderId)
        orderItems = orderViewModel.getOrderItems(orderId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Order Details") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        order?.let {
                            editPoNumber = it.poNumber
                            editCustomerName = it.customerName
                            editCompanyName = it.company_name
                            editTotalAmount = it.total_amount.toString()
                            showEditDialog = true
                        }
                    }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Order")
                    }
                    IconButton(onClick = { showDeleteConfirm = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete Order", tint = MaterialTheme.colorScheme.error)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            order?.let { o ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("PO Number: ${o.poNumber}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Company: ${o.company_name.ifBlank { "SmartPO Industrial Corp" }}", style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text("Customer: ${o.customerName}", style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Total: ${ExportHelper.formatRupee(o.total_amount)}", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Export Buttons Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = { ExportHelper.exportToPdf(context, o, orderItems) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text("Export PDF")
                    }
                    
                    OutlinedButton(
                        onClick = { ExportHelper.exportToExcel(context, o, orderItems) },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Export Excel")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text("Ordered Items", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(orderItems) { item ->
                        var catalogItem by remember { mutableStateOf<ItemEntity?>(null) }
                        LaunchedEffect(item.itemId) {
                            catalogItem = catalogViewModel.getItemById(item.itemId)
                        }
                        ListItem(
                            headlineContent = { Text(catalogItem?.name ?: item.product_name, fontWeight = FontWeight.Medium) },
                            supportingContent = { Text("Qty: ${item.quantity} ${item.unit} | Unit Price: ${ExportHelper.formatRupee(item.unitPrice)}") },
                            trailingContent = { Text(ExportHelper.formatRupee(item.quantity * item.unitPrice), fontWeight = FontWeight.Bold) }
                        )
                        Divider()
                    }
                }
            }
        }
    }

    // Edit Dialog
    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Order Details") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = editPoNumber,
                        onValueChange = { editPoNumber = it },
                        label = { Text("PO Number") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = editCompanyName,
                        onValueChange = { editCompanyName = it },
                        label = { Text("Company Name") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = editCustomerName,
                        onValueChange = { editCustomerName = it },
                        label = { Text("Customer Name") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = editTotalAmount,
                        onValueChange = { editTotalAmount = it },
                        label = { Text("Total Amount (₹)") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    order?.let {
                        val updated = it.copy(
                            order_number = editPoNumber,
                            company_name = editCompanyName,
                            customer_name = editCustomerName,
                            total_amount = editTotalAmount.toDoubleOrNull() ?: it.total_amount
                        )
                        orderViewModel.updateOrder(updated)
                        order = updated
                        showEditDialog = false
                    }
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Delete Confirmation Dialog
    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete Purchase Order") },
            text = { Text("Are you sure you want to permanently delete this purchase order? This action cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        orderViewModel.deleteOrder(orderId)
                        showDeleteConfirm = false
                        onBack()
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
