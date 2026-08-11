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
import com.example.smartpo.util.LanguageManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController) {
    val context = LocalContext.current
    val currentLang by LanguageManager.currentLanguage.collectAsState()

    // Dialog visibility states
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }
    var showTermsDialog by remember { mutableStateOf(false) }
    var showLanguageDialog by remember { mutableStateOf(false) }

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
                title = { Text(LanguageManager.getString("profile_settings"), fontWeight = FontWeight.Bold) }
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
                        title = LanguageManager.getString("edit_profile"),
                        subtitle = LanguageManager.getString("edit_profile_sub"),
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
                        title = LanguageManager.getString("change_password"),
                        subtitle = LanguageManager.getString("change_password_sub"),
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
                        title = LanguageManager.getString("privacy_policy"),
                        subtitle = LanguageManager.getString("privacy_policy_sub"),
                        onClick = { showPrivacyDialog = true }
                    )
                    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 0.5.dp)
                    ProfileOptionItem(
                        icon = Icons.Default.Description,
                        title = LanguageManager.getString("terms_conditions"),
                        subtitle = LanguageManager.getString("terms_conditions_sub"),
                        onClick = { showTermsDialog = true }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Section: App Preferences & Multi-Language
            Card(
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    ProfileOptionItem(
                        icon = Icons.Default.Language,
                        title = LanguageManager.getString("app_language") + " / भाषा / மொழி",
                        subtitle = "Current: ${currentLang.displayName}",
                        onClick = { showLanguageDialog = true }
                    )
                }
            }

            // Language Selection Dialog
            if (showLanguageDialog) {
                AlertDialog(
                    onDismissRequest = { showLanguageDialog = false },
                    title = { Text(LanguageManager.getString("select_language"), fontWeight = FontWeight.Bold) },
                    text = {
                        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                            com.example.smartpo.util.AppLanguage.values().forEach { lang ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            LanguageManager.setLanguage(context, lang)
                                            showLanguageDialog = false
                                            (context as? android.app.Activity)?.recreate()
                                        }
                                        .padding(vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = (currentLang == lang),
                                        onClick = {
                                            LanguageManager.setLanguage(context, lang)
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
                Text(LanguageManager.getString("logout"), fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }

    // Edit Profile Dialog
    if (showEditProfileDialog) {
        AlertDialog(
            onDismissRequest = { showEditProfileDialog = false },
            title = { Text(LanguageManager.getString("edit_profile"), fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = tempName,
                        onValueChange = { tempName = it },
                        label = { Text("Full Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = tempPhone,
                        onValueChange = { tempPhone = it },
                        label = { Text("Phone Number") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = tempCompany,
                        onValueChange = { tempCompany = it },
                        label = { Text("Company Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    userName = tempName
                    userPhone = tempPhone
                    userCompany = tempCompany
                    showEditProfileDialog = false
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

    // Change Password Dialog
    if (showChangePasswordDialog) {
        AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            title = { Text(LanguageManager.getString("change_password"), fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirm New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (passwordError.isNotEmpty()) {
                        Text(
                            text = passwordError,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (newPassword.isBlank()) {
                        passwordError = "New password cannot be empty"
                    } else if (newPassword != confirmPassword) {
                        passwordError = "Passwords do not match"
                    } else {
                        showChangePasswordDialog = false
                    }
                }) {
                    Text("Update Password")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangePasswordDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Privacy Policy Dialog
    if (showPrivacyDialog) {
        AlertDialog(
            onDismissRequest = { showPrivacyDialog = false },
            title = { Text(LanguageManager.getString("privacy_policy"), fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "SmartPO respects your privacy. All purchase order records, customer data, and item catalogs stored within SmartPO are encrypted and stored securely.",
                    fontSize = 14.sp
                )
            },
            confirmButton = {
                Button(onClick = { showPrivacyDialog = false }) {
                    Text("OK")
                }
            }
        )
    }

    // Terms & Conditions Dialog
    if (showTermsDialog) {
        AlertDialog(
            onDismissRequest = { showTermsDialog = false },
            title = { Text(LanguageManager.getString("terms_conditions"), fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "By using SmartPO, you agree to generate purchase orders accurately and maintain valid supplier details. System logs are audited for enterprise compliance.",
                    fontSize = 14.sp
                )
            },
            confirmButton = {
                Button(onClick = { showTermsDialog = false }) {
                    Text("I Agree")
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
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Text(text = subtitle, fontSize = 12.sp, color = Color.Gray)
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = Color.Gray
        )
    }
}
