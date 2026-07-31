package com.example.smartpo.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.smartpo.viewmodel.OrderViewModel
import com.example.smartpo.viewmodel.CatalogViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiOrderAssistantScreen(
    navController: NavController,
    orderViewModel: OrderViewModel,
    catalogViewModel: CatalogViewModel
) {
    var userText by remember { mutableStateOf("") }
    val allCatalogItems by catalogViewModel.getAllItems().collectAsState(initial = emptyList())
    
    val aiIsLoading by orderViewModel.aiIsLoading.collectAsState()
    val aiError by orderViewModel.aiError.collectAsState()
    val aiFoundItems by orderViewModel.aiFoundItems.collectAsState()
    
    val exampleChips = listOf(
        "10 MS flanges 2 inch",
        "5 PTFE tube 3 inch",
        "20 GI bolts half inch 2 inch",
        "SS304 pipe 1 inch 5 nos",
        "Bellows 2 inch 100mm 3 pieces"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("AI Order Assistant", fontWeight = FontWeight.Bold)
                        Text("Powered by Gemini AI", fontSize = 12.sp, color = Color.Gray)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // HEADER CARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1A3C6E)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.SmartToy,
                        contentDescription = "AI",
                        tint = Color.White,
                        modifier = Modifier.size(40.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = "Describe what you need",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            text = "Type in any language - English or Hindi",
                            color = Color(0xFF90CAF9),
                            fontSize = 14.sp
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // EXAMPLE CHIPS
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(exampleChips) { chipText ->
                    AssistChip(
                        onClick = { userText = chipText },
                        label = { Text(chipText) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // INPUT SECTION
            OutlinedTextField(
                value = userText,
                onValueChange = { userText = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 150.dp),
                placeholder = { 
                    Text("Type what items you need...\nExample: I need 10 MS flanges 2 inch \nand 5 PTFE tubes 3 inch") 
                },
                trailingIcon = {
                    IconButton(onClick = { /* Handle Voice Input via SpeechRecognizer later */ }) {
                        Icon(Icons.Default.Mic, contentDescription = "Voice Input")
                    }
                }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // BUTTON ROW
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(onClick = { userText = "" }) {
                    Text("Clear")
                }
                
                Button(
                    onClick = { orderViewModel.parseOrderWithAi(userText, allCatalogItems) },
                    enabled = !aiIsLoading && userText.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A3C6E))
                ) {
                    if (aiIsLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text("Find Items with AI")
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // RESULTS SECTION
            if (aiIsLoading) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Gemini AI is analyzing your request...", color = Color.Gray)
                }
            } else if (aiError != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Error", color = Color.Red, fontWeight = FontWeight.Bold)
                        Text(text = aiError ?: "", color = Color.Red)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { orderViewModel.parseOrderWithAi(userText, allCatalogItems) },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                        ) {
                            Text("Try Again")
                        }
                    }
                }
            } else if (aiFoundItems.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Success", tint = Color(0xFF2E7D32))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Found ${aiFoundItems.size} items! Added to order.",
                                color = Color(0xFF2E7D32),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                for (item in aiFoundItems) {
                    val isAvailable = item.is_available
                    val cardBg = if (isAvailable) MaterialTheme.colorScheme.surface else Color(0xFFFFEBEE)
                    val textColor = if (isAvailable) MaterialTheme.colorScheme.onSurface else Color(0xFFC62828)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        colors = CardDefaults.cardColors(containerColor = cardBg),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.product_name ?: "Unknown Item", 
                                    fontWeight = FontWeight.Bold,
                                    color = textColor
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                if (!isAvailable) {
                                    Text(
                                        text = "Status: Not Available in Catalog", 
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFFC62828)
                                    )
                                } else {
                                    Text(
                                        text = "Status: Available (Cost: $${item.unit_price})", 
                                        fontSize = 12.sp,
                                        color = Color(0xFF2E7D32)
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("Qty: ${item.quantity ?: 1}", fontWeight = FontWeight.Medium)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(item.unit ?: "pcs", color = Color.Gray)
                                }
                            }
                            if (isAvailable) {
                                IconButton(onClick = { orderViewModel.removeItemFromOrder(item.itemId ?: "") }) {
                                    Icon(Icons.Default.Close, contentDescription = "Remove", tint = Color.Gray)
                                }
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = {
                        navController.popBackStack()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF57C00)) // Orange
                ) {
                    Text("Go to Order Summary", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
