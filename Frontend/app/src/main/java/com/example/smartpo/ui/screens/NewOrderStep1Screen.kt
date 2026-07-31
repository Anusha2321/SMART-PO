package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.smartpo.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewOrderStep1Screen(
    onNavigateToStep2: (String, String, String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: OrderViewModel = viewModel()
) {
    var name by remember { mutableStateOf(viewModel.customerName) }
    var email by remember { mutableStateOf(viewModel.customerEmail) }
    var poNum by remember { mutableStateOf(viewModel.poNumber) }
    var error by remember { mutableStateOf("") }

    LaunchedEffect(key1 = true) {
        if (poNum.isBlank()) {
            val dateStr = java.text.SimpleDateFormat("yyyyMMdd", java.util.Locale.getDefault()).format(java.util.Date())
            val randomNum = (1000..9999).random()
            poNum = "VMNR-$dateStr-$randomNum"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New PO - Step 1 of 3") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Purchase Order Details",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Enter client company information and the Purchase Order registration number",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                modifier = Modifier.align(Alignment.Start)
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = poNum,
                onValueChange = {
                    poNum = it
                    error = ""
                },
                label = { Text("Purchase Order Number") },
                leadingIcon = { Icon(Icons.Default.Info, contentDescription = "PO Number") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = {
                    name = it
                    error = ""
                },
                label = { Text("Customer / Client Name") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Customer Name") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = email,
                onValueChange = {
                    email = it
                    error = ""
                },
                label = { Text("Customer Email Address") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Customer Email") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(32.dp))

            if (error.isNotEmpty()) {
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            Button(
                onClick = {
                    val trimmedName = name.trim()
                    val trimmedEmail = email.trim()
                    val trimmedPo = poNum.trim()

                    if (trimmedPo.isEmpty()) {
                        error = "PO Number cannot be empty"
                        return@Button
                    }
                    if (trimmedName.isEmpty()) {
                        error = "Customer Name cannot be empty"
                        return@Button
                    }
                    if (trimmedEmail.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(trimmedEmail).matches()) {
                        error = "Please enter a valid client email address"
                        return@Button
                    }

                    viewModel.customerName = trimmedName
                    viewModel.customerEmail = trimmedEmail
                    viewModel.poNumber = trimmedPo

                    onNavigateToStep2(trimmedName, trimmedEmail, trimmedPo)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Next: Select Items",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
