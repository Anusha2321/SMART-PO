package com.example.smartpo.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.smartpo.ui.components.BottomNavigationBar
import com.example.smartpo.ui.screens.*
import com.example.smartpo.viewmodel.*



@Composable
fun AppNavigation(
    authViewModel: AuthViewModel,
    catalogViewModel: CatalogViewModel,
    orderViewModel: OrderViewModel,
    homeViewModel: HomeViewModel
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarScreens = listOf(
        Screen.Home.route,
        Screen.Catalog.route,
        Screen.OrderHistory.route,
        Screen.Profile.route
    )

    Scaffold(
        bottomBar = {
            if (bottomBarScreens.contains(currentRoute)) {
                BottomNavigationBar(navController = navController)
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(navController = navController)
            }
            
            composable(Screen.Welcome.route) {
                WelcomeScreen(
                    onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                    onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) }
                )
            }
            
            composable(Screen.Login.route) {
                LoginScreen(navController = navController)
            }
            
            composable(Screen.SignUp.route) {
                val context = androidx.compose.ui.platform.LocalContext.current
                SignUpScreen(
                    viewModel = authViewModel,
                    onSignUpSuccess = {
                        val prefs = context.getSharedPreferences("smartpo_auth", android.content.Context.MODE_PRIVATE)
                        prefs.edit()
                            .putBoolean("is_registered", true)
                            .putBoolean("is_logged_in", true)
                            .apply()
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Welcome.route) { inclusive = true }
                            popUpTo(Screen.SignUp.route) { inclusive = true }
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Home.route) {
                val catalogItems by catalogViewModel.getAllItems().collectAsState(initial = emptyList())
                val orders by orderViewModel.getAllOrders().collectAsState(initial = emptyList())
                HomeScreen(
                    totalItems = catalogItems.size,
                    totalOrders = orders.size,
                    onNavigateToNewOrder = { navController.navigate(Screen.OrderStep1.route) },
                    onNavigateToAi = { navController.navigate("ai_assistant") },
                    onNavigateToOrders = { 
                        // Navigate to Order History screen
                        navController.navigate(Screen.OrderHistory.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
            
            composable(Screen.OrderStep1.route) {
                OrderStep1Screen(
                    viewModel = orderViewModel,
                    onNext = { navController.navigate(Screen.OrderStep2.route) },
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable(Screen.OrderStep2.route) {
                OrderStep2Screen(
                    orderViewModel = orderViewModel,
                    catalogViewModel = catalogViewModel,
                    onNext = { navController.navigate(Screen.OrderStep3.route) },
                    onBack = { navController.popBackStack() },
                    onNavigateToAi = { navController.navigate("ai_assistant") }
                )
            }

            composable(Screen.OrderStep3.route) {
                OrderStep3Screen(
                    orderViewModel = orderViewModel,
                    catalogViewModel = catalogViewModel,
                    onSubmitSuccess = { _ ->
                        homeViewModel.loadStats()
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable(Screen.OrderHistory.route) {
                OrderHistoryScreen(
                    viewModel = orderViewModel,
                    onOrderClick = { orderId ->
                        navController.navigate(Screen.OrderDetail.createRoute(orderId))
                    }
                )
            }
            
            composable(
                route = Screen.OrderDetail.route,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                OrderDetailScreen(
                    orderId = orderId,
                    orderViewModel = orderViewModel,
                    catalogViewModel = catalogViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable(Screen.Catalog.route) {
                CatalogScreen(
                    onCategoryClick = { category ->
                        navController.navigate(Screen.CategoryItems.createRoute(category))
                    }
                )
            }
            
            composable(
                route = Screen.CategoryItems.route,
                arguments = listOf(navArgument("category") { type = NavType.StringType })
            ) { backStackEntry ->
                val category = backStackEntry.arguments?.getString("category") ?: ""
                CategoryItemsScreen(
                    category = category,
                    viewModel = catalogViewModel,
                    onNavigateToAddItem = { navController.navigate(Screen.AddItem.route) },
                    onNavigateToEditItem = { itemId ->
                        navController.navigate(Screen.EditItem.createRoute(itemId))
                    },
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable(Screen.AddItem.route) {
                AddItemScreen(
                    catalogViewModel = catalogViewModel,
                    orderViewModel = orderViewModel,
                    onBack = { 
                        navController.popBackStack()
                        homeViewModel.loadStats()
                    }
                )
            }
            
            composable(
                route = Screen.EditItem.route,
                arguments = listOf(navArgument("itemId") { type = NavType.StringType })
            ) { backStackEntry ->
                val itemId = backStackEntry.arguments?.getString("itemId") ?: ""
                EditItemScreen(
                    itemId = itemId,
                    catalogViewModel = catalogViewModel,
                    orderViewModel = orderViewModel,
                    onBack = { navController.popBackStack() },
                    onOrderSuccess = {
                        navController.navigate(Screen.OrderHistory.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
            
            composable(Screen.Profile.route) {
                ProfileScreen(navController = navController)
            }
            
            composable(Screen.Settings.route) {
                SettingsScreen(navController = navController)
            }
            
            composable("ai_assistant") {
                AiOrderAssistantScreen(
                    navController = navController,
                    orderViewModel = orderViewModel,
                    catalogViewModel = catalogViewModel
                )
            }
        }
    }
}
