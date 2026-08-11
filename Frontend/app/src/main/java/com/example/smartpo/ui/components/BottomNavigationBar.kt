package com.example.smartpo.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.example.smartpo.ui.navigation.Screen
import com.example.smartpo.util.LanguageManager

@Composable
fun BottomNavigationBar(navController: NavController) {
    val currentLang by LanguageManager.currentLanguage.collectAsState()

    val items = listOf(
        Screen.Home to Icons.Default.Home,
        Screen.OrderHistory to Icons.Default.List,
        Screen.Catalog to Icons.Default.ShoppingCart,
        Screen.Profile to Icons.Default.Person
    )

    NavigationBar {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route

        items.forEach { (screen, icon) ->
            val isSelected = currentRoute == screen.route

            val tabLabel = when (screen) {
                Screen.Home -> LanguageManager.getString("nav_home")
                Screen.OrderHistory -> LanguageManager.getString("nav_orders")
                Screen.Catalog -> LanguageManager.getString("nav_catalog")
                Screen.Profile -> LanguageManager.getString("nav_profile")
                else -> screen.route
            }

            NavigationBarItem(
                icon = { Icon(icon, contentDescription = tabLabel) },
                label = { Text(tabLabel) },
                selected = isSelected,
                onClick = {
                    if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(Screen.Home.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}
