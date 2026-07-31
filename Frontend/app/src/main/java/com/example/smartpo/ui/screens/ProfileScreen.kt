package com.example.smartpo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController) {
    val context = LocalContext.current

    // Dialog visibility states
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }
    var showTermsDialog by remember { mutableStateOf(false) }

    // User Profile Data
    var userName by remember { mutableStateOf("Admin Account") }
    var userPhone by remember { mutableStateOf("+91 98765 43210") }
    var userCompany by remember { mutableStateOf("SmartPO Ltd") }
    val userEmail = "admin@smartpo.com"

    // Edit Profile Input States
    var tempName by remember { mutableStateOf(userName) }
    var tempPhone by remember { mutableStateOf(userPhone) }
    var tempCompany by remember { mutableStateOf(userCompany) }

    // Change Password Input States
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile Settings", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Profile Header / Avatar
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer)
            ) {
                val initials = userName.split(" ")
                    .mapNotNull { it.firstOrNull()?.uppercaseChar() }
                    .take(2)
                    .joinToString("")
                Text(
                    text = initials.ifEmpty { "A" },
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = userName,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = userEmail,
                fontSize = 14.sp,
                color = Color.Gray
            )
            Text(
                text = userPhone,
                fontSize = 14.sp,
                color = Color.Gray
            )
            Text(
                text = "Company: $userCompany",
                fontSize = 14.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Section: Account Actions
            Card(
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    ProfileOptionItem(
                        icon = Icons.Default.Person,
                        title = "Edit Profile",
                        subtitle = "Change your name and contact details",
                        onClick = {
                            tempName = userName
                            tempPhone = userPhone
                            tempCompany = userCompany
                            showEditProfileDialog = true
                        }
                    )
                    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 0.5.dp)
                    ProfileOptionItem(
                        icon = Icons.Default.Lock,
                        title = "Change Password",
                        subtitle = "Update your security credentials",
                        onClick = {
                            currentPassword = ""
                            newPassword = ""
                            confirmPassword = ""
                            passwordError = ""
                            showChangePasswordDialog = true
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Section: Legal & Policies
            Card(
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    ProfileOptionItem(
                        icon = Icons.Default.Shield,
                        title = "Privacy Policy",
                        subtitle = "Understand how we protect your data",
                        onClick = { showPrivacyDialog = true }
                    )
                    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 0.5.dp)
                    ProfileOptionItem(
                        icon = Icons.Default.Description,
                        title = "Terms & Conditions",
                        subtitle = "Review our rules and service agreement",
                        onClick = { showTermsDialog = true }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Section: App Preferences & Multi-Language
            var showLanguageDialog by remember { mutableStateOf(false) }
            val currentLang by com.example.smartpo.util.LanguageManager.currentLanguage.collectAsState()

            Card(
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    ProfileOptionItem(
                        icon = Icons.Default.Language,
                        title = "App Language / भाषा / மொழி",
                        subtitle = "Current: ${currentLang.displayName}",
                        onClick = { showLanguageDialog = true }
                    )
                }
            }

            // Language Selection Dialog
            if (showLanguageDialog) {
                AlertDialog(
                    onDismissRequest = { showLanguageDialog = false },
                    title = { Text("Select App Language", fontWeight = FontWeight.Bold) },
                    text = {
                        Column {
                            com.example.smartpo.util.AppLanguage.values().forEach { lang ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            com.example.smartpo.util.LanguageManager.setLanguage(context, lang)
                                            showLanguageDialog = false
                                            (context as? android.app.Activity)?.recreate()
                                        }
                                        .padding(vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = (currentLang == lang),
                                        onClick = {
                                            com.example.smartpo.util.LanguageManager.setLanguage(context, lang)
                                            showLanguageDialog = false
                                            (context as? android.app.Activity)?.recreate()
                                        }
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = lang.displayName,
                                        fontSize = 16.sp,
                                        fontWeight = if (currentLang == lang) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { showLanguageDialog = false }) {
                            Text("Close")
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Logout Button
            Button(
                onClick = { 
                    val prefs = context.getSharedPreferences("smartpo_auth", android.content.Context.MODE_PRIVATE)
                    prefs.edit().putBoolean("is_logged_in", false).apply()
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(48.dp),
                shape = RoundedCornerShape(24.dp)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Logout", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }

    // 1. Edit Profile Dialog
    if (showEditProfileDialog) {
        AlertDialog(
            onDismissRequest = { showEditProfileDialog = false },
            title = { Text("Edit Profile", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = tempName,
                        onValueChange = { tempName = it },
                        label = { Text("Name") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = tempPhone,
                        onValueChange = { tempPhone = it },
                        label = { Text("Phone Number") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = tempCompany,
                        onValueChange = { tempCompany = it },
                        label = { Text("Company Name") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (tempName.isNotBlank()) {
                        userName = tempName
                        userPhone = tempPhone
                        userCompany = tempCompany
                        showEditProfileDialog = false
                    }
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditProfileDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // 2. Change Password Dialog
    if (showChangePasswordDialog) {
        AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            title = { Text("Change Password", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirm New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true
                    )
                    if (passwordError.isNotEmpty()) {
                        Text(passwordError, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                        passwordError = "All fields are required"
                    } else if (newPassword != confirmPassword) {
                        passwordError = "Passwords do not match"
                    } else {
                        // Password successfully updated mock
                        showChangePasswordDialog = false
                    }
                }) {
                    Text("Update")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangePasswordDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // 3. Privacy Policy Dialog
    if (showPrivacyDialog) {
        AlertDialog(
            onDismissRequest = { showPrivacyDialog = false },
            title = { Text("Privacy Policy", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier
                        .heightIn(max = 300.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = """
                            Effective Date: July 24, 2026

                            At SmartPO, we prioritize the protection and confidentiality of your business and personal data. This Privacy Policy details how we collect, store, and process your purchasing information.

                            1. Data Collection
                            We collect account details (name, email, phone number) and purchase order (PO) generation data, including item names, catalog metadata, and prices, to facilitate seamless PO management.

                            2. Data Utilization
                            Your data is solely used to process purchase orders, match catalog items using our Gemini AI assistant, and verify analytics. We do not sell or share your data with unauthorized third parties.

                            3. Security Measures
                            We employ state-of-the-art encryption protocols (HTTPS, end-to-end database security via Supabase) to ensure all data remains protected against unauthorized breaches.

                            If you have questions regarding this policy, please reach out to support@smartpo.com.
                        """.trimIndent(),
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showPrivacyDialog = false }) {
                    Text("Close")
                }
            }
        )
    }

    // 4. Terms and Conditions Dialog
    if (showTermsDialog) {
        AlertDialog(
            onDismissRequest = { showTermsDialog = false },
            title = { Text("Terms & Conditions", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier
                        .heightIn(max = 300.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = """
                            Effective Date: July 24, 2026

                            Welcome to SmartPO. By accessing and using our application, you agree to comply with the following Terms and Conditions.

                            1. License & Access
                            We grant you a non-transferable, non-exclusive license to use the SmartPO platform strictly for generating, reviewing, and handling company purchase orders.

                            2. AI Feature Usage
                            Our AI Order Assistant is powered by Gemini AI. While we strive for extreme precision in catalog matching, all AI-generated matching results must be verified by the admin before making final purchase orders.

                            3. Account Responsibility
                            You are fully responsible for maintaining the confidentiality of your credentials. Any actions performed under your account will be deemed authorized by your organization.

                            4. Modifications
                            SmartPO reserves the right to modify these terms at any time. Continued use of the app signifies your acceptance of any revisions.
                        """.trimIndent(),
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showTermsDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun ProfileOptionItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(28.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(text = title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Text(text = subtitle, color = Color.Gray, fontSize = 12.sp)
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = Color.Gray,
            modifier = Modifier.size(20.dp)
        )
    }
}

