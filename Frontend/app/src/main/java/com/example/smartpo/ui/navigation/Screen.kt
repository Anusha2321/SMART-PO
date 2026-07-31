package com.example.smartpo.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Welcome : Screen("welcome")
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object Home : Screen("home")
    object OrderStep1 : Screen("order_step1")
    object OrderStep2 : Screen("order_step2")
    object OrderStep3 : Screen("order_step3")
    object OrderHistory : Screen("order_history")
    object OrderDetail : Screen("order_detail/{orderId}") {
        fun createRoute(orderId: String) = "order_detail/$orderId"
    }
    object Catalog : Screen("catalog")
    object CategoryItems : Screen("category_items/{category}") {
        fun createRoute(category: String) = "category_items/$category"
    }
    object AddItem : Screen("add_item")
    object EditItem : Screen("edit_item/{itemId}") {
        fun createRoute(itemId: String) = "edit_item/$itemId"
    }
    object Profile : Screen("profile")
    object Settings : Screen("settings")
}
