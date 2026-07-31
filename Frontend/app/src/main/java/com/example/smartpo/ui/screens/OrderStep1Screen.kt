package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderStep1Screen(
    viewModel: OrderViewModel,
    onNext: () -> Unit,
    onBack: () -> Unit
) {
    var error by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New PO - Step 1/3") },
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
            OutlinedTextField(
                value = viewModel.poNumber,
                onValueChange = { viewModel.poNumber = it },
                label = { Text("PO Number") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.companyName,
                onValueChange = { viewModel.companyName = it },
                label = { Text("Company Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.customerName,
                onValueChange = { viewModel.customerName = it },
                label = { Text("Customer Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.customerEmail,
                onValueChange = { viewModel.customerEmail = it },
                label = { Text("Customer Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            if (error.isNotEmpty()) {
                Text(error, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(vertical = 8.dp))
            }
            
            Spacer(modifier = Modifier.weight(1f))
            Button(
                onClick = {
                    if (viewModel.poNumber.isBlank() || viewModel.customerName.isBlank() || viewModel.customerEmail.isBlank()) {
                        error = "Please fill all required fields"
                    } else {
                        onNext()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Next: Select Items")
            }
        }
    }
}
