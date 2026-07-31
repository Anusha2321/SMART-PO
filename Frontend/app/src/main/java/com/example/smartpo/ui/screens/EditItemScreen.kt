package com.example.smartpo.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartpo.data.database.ItemEntity
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditItemScreen(
    itemId: String,
    catalogViewModel: CatalogViewModel,
    orderViewModel: OrderViewModel,
    onBack: () -> Unit,
    onOrderSuccess: () -> Unit
) {
    val context = LocalContext.current
    var item by remember { mutableStateOf<ItemEntity?>(null) }
    
    var name by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priceStr by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("") }

    // Direct Ordering States
    var showOrderDialog by remember { mutableStateOf(false) }
    var orderQty by remember { mutableStateOf("1") }
    var orderCustomer by remember { mutableStateOf("Admin Account") }
    var orderPoNumber by remember { mutableStateOf("") }

    LaunchedEffect(itemId) {
        item = catalogViewModel.getItemById(itemId)
        item?.let {
            name = it.name
            category = it.category
            description = it.description
            priceStr = it.price.toString()
            unit = it.unit
        }
        orderPoNumber = "PO-${System.currentTimeMillis().toString().takeLast(6)}-${(1000..9999).random()}"
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Item") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Item Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = category,
                onValueChange = { category = it },
                label = { Text("Category") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = priceStr,
                onValueChange = { priceStr = it },
                label = { Text("Price") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            // Direct Order Section
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Direct Order Options", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Place a fast order for this product catalog item instantly.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Button(
                        onClick = { showOrderDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Create Instant Order")
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = {
                    item?.let {
                        val price = priceStr.toDoubleOrNull() ?: it.price
                        val updatedItem = it.copy(name = name, category = category, price_per_kg = price)
                        catalogViewModel.updateItem(updatedItem)
                        Toast.makeText(context, "Item updated successfully", Toast.LENGTH_SHORT).show()
                        onBack()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Update Catalog Item")
            }
        }
    }

    // Direct Order Dialog
    if (showOrderDialog) {
        AlertDialog(
            onDismissRequest = { showOrderDialog = false },
            title = { Text("Order This Item") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = orderPoNumber,
                        onValueChange = { orderPoNumber = it },
                        label = { Text("PO Number") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = orderCustomer,
                        onValueChange = { orderCustomer = it },
                        label = { Text("Customer Name") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = orderQty,
                        onValueChange = { orderQty = it },
                        label = { Text("Quantity") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    val qty = orderQty.toIntOrNull() ?: 1
                    val price = priceStr.toDoubleOrNull() ?: 0.0
                    val finalPo = if (orderPoNumber.isBlank() || orderPoNumber == "PO-${(10000..99999).random()}") {
                        "PO-${System.currentTimeMillis().toString().takeLast(6)}-${(1000..9999).random()}"
                    } else {
                        orderPoNumber
                    }
                    orderViewModel.createDirectOrder(
                        poNo = finalPo,
                        custName = orderCustomer,
                        itemName = name,
                        qty = qty,
                        price = price,
                        unit = unit.ifEmpty { "pcs" }
                    )
                    showOrderDialog = false
                    Toast.makeText(context, "Order placed successfully! PO: $finalPo", Toast.LENGTH_LONG).show()
                    onOrderSuccess()
                }) {
                    Text("Place Order")
                }
            },
            dismissButton = {
                TextButton(onClick = { showOrderDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
