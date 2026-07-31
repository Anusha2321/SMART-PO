package com.example.smartpo.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Edit
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import com.example.smartpo.data.database.OrderItemEntity
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.smartpo.data.database.ItemEntity
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderStep2Screen(
    orderViewModel: OrderViewModel,
    catalogViewModel: CatalogViewModel,
    onNext: () -> Unit,
    onBack: () -> Unit,
    onNavigateToAi: () -> Unit
) {
    var showDialog by remember { mutableStateOf(false) }
    var itemToEdit by remember { mutableStateOf<OrderItemEntity?>(null) }
    val catalogItems by catalogViewModel.getAllItems().collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New PO - Step 2/3") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Item")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            LazyColumn(modifier = Modifier.weight(1f).fillMaxWidth()) {
                items(orderViewModel.selectedItems) { orderItem ->
                    var item by remember { mutableStateOf<ItemEntity?>(null) }
                    LaunchedEffect(orderItem.itemId) {
                        item = catalogViewModel.getItemById(orderItem.itemId)
                    }
                    ListItem(
                        headlineContent = { Text(item?.name ?: "Loading...") },
                        supportingContent = { Text("Qty: ${orderItem.quantity} x $${orderItem.unitPrice}") },
                        trailingContent = {
                            Row {
                                IconButton(onClick = { itemToEdit = orderItem }) {
                                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Color(0xFF1A3C6E))
                                }
                                IconButton(onClick = { orderViewModel.removeItemFromOrder(orderItem.itemId) }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                                }
                            }
                        }
                    )
                    Divider()
                }
            }

            Button(
                onClick = onNext,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .height(56.dp),
                enabled = orderViewModel.selectedItems.isNotEmpty()
            ) {
                Text("Next: Review")
            }
        }
        
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
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

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Select Item") },
                text = {
                    LazyColumn {
                        items(catalogItems) { item ->
                            ListItem(
                                headlineContent = { Text(item.name) },
                                supportingContent = { Text("$${item.price}") },
                                modifier = Modifier.clickable {
                                    orderViewModel.addItemToOrder(item.id, item.name, 1, item.price, item.unit)
                                    showDialog = false
                                }
                            )
                            Divider()
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showDialog = false }) { Text("Close") }
                }
            )
        }

        if (itemToEdit != null) {
            var editQty by remember(itemToEdit) { mutableStateOf(itemToEdit!!.quantity.toString()) }
            var editPrice by remember(itemToEdit) { mutableStateOf(itemToEdit!!.unitPrice.toString()) }
            
            AlertDialog(
                onDismissRequest = { itemToEdit = null },
                title = { Text("Edit Item") },
                text = {
                    Column {
                        OutlinedTextField(
                            value = editQty,
                            onValueChange = { editQty = it },
                            label = { Text("Quantity") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = editPrice,
                            onValueChange = { editPrice = it },
                            label = { Text("Price") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        val q = editQty.toIntOrNull() ?: itemToEdit!!.quantity
                        val p = editPrice.toDoubleOrNull() ?: itemToEdit!!.unitPrice
                        orderViewModel.updateItemInOrder(itemToEdit!!.itemId, q, p)
                        itemToEdit = null
                    }) { Text("Save") }
                },
                dismissButton = {
                    TextButton(onClick = { itemToEdit = null }) { Text("Cancel") }
                }
            )
        }
    }
}
