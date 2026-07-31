package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartpo.data.database.ItemEntity
import com.example.smartpo.data.database.OrderEntity
import com.example.smartpo.util.ExportHelper
import com.example.smartpo.viewmodel.CatalogViewModel
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderStep3Screen(
    orderViewModel: OrderViewModel,
    catalogViewModel: CatalogViewModel,
    onSubmitSuccess: (Long) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New PO - Review") },
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
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("PO Number: ${orderViewModel.poNumber}", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Company: ${orderViewModel.companyName}")
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Customer: ${orderViewModel.customerName}")
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Email: ${orderViewModel.customerEmail}")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Text("Items:", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(8.dp))
            
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(orderViewModel.selectedItems) { orderItem ->
                    var item by remember { mutableStateOf<ItemEntity?>(null) }
                    LaunchedEffect(orderItem.itemId) {
                        item = catalogViewModel.getItemById(orderItem.itemId)
                    }
                    ListItem(
                        headlineContent = { Text(item?.name ?: orderItem.product_name) },
                        supportingContent = { Text("Qty: ${orderItem.quantity} ${orderItem.unit} | Unit Price: ${ExportHelper.formatRupee(orderItem.unitPrice)}") },
                        trailingContent = { Text(ExportHelper.formatRupee(orderItem.quantity * orderItem.unitPrice), fontWeight = FontWeight.Bold) }
                    )
                    Divider()
                }
            }
            
            Text(
                "Total Amount: ${ExportHelper.formatRupee(orderViewModel.getTotalAmount())}",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 12.dp)
            )

            // Direct Export Action buttons prior to submitting or right with submission
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        val tempOrder = OrderEntity(
                            order_number = orderViewModel.poNumber,
                            customer_name = orderViewModel.customerName,
                            company_name = orderViewModel.companyName,
                            total_amount = orderViewModel.getTotalAmount()
                        )
                        ExportHelper.exportToPdf(context, tempOrder, orderViewModel.selectedItems.toList())
                    },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Export PDF")
                }

                OutlinedButton(
                    onClick = {
                        val tempOrder = OrderEntity(
                            order_number = orderViewModel.poNumber,
                            customer_name = orderViewModel.customerName,
                            company_name = orderViewModel.companyName,
                            total_amount = orderViewModel.getTotalAmount()
                        )
                        ExportHelper.exportToExcel(context, tempOrder, orderViewModel.selectedItems.toList())
                    },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Export Excel")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = { orderViewModel.submitOrder(onSubmitSuccess) },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Submit Order", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
