package com.example.smartpo.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartpo.data.database.OrderEntity
import com.example.smartpo.data.database.OrderItemEntity
import com.example.smartpo.network.SupabaseClient
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.UUID
import java.util.concurrent.TimeUnit

class OrderViewModel : ViewModel() {
    private val geminiClient = okhttp3.OkHttpClient.Builder()
        .connectTimeout(90, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .writeTimeout(90, TimeUnit.SECONDS)
        .build()
    var poNumber by mutableStateOf("PO-${System.currentTimeMillis().toString().takeLast(6)}-${(1000..9999).random()}")
    var customerName by mutableStateOf("")
    var companyName by mutableStateOf("SmartPO Industrial Corp")
    var customerEmail by mutableStateOf("")
    
    // Additional fields for live database schema
    var customerPhone by mutableStateOf("")
    var customerAddress by mutableStateOf("")
    var notes by mutableStateOf("")

    val selectedItems = mutableStateListOf<OrderItemEntity>()
    val savedOrderItems = mutableStateListOf<OrderItemEntity>()
    
    private val _orders = MutableStateFlow<List<OrderEntity>>(emptyList())
    
    // AI Assistant state
    private val _aiIsLoading = MutableStateFlow(false)
    val aiIsLoading: StateFlow<Boolean> = _aiIsLoading

    private val _aiError = MutableStateFlow<String?>(null)
    val aiError: StateFlow<String?> = _aiError

    private val _aiFoundItems = MutableStateFlow<List<AiMatchedItem>>(emptyList())
    val aiFoundItems: StateFlow<List<AiMatchedItem>> = _aiFoundItems

    private val GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

    init {
        loadOrdersFromLocalAndCloud()
    }

    private fun saveOrdersToLocalDisk() {
        try {
            val context = com.example.smartpo.SmartPoApplication.instance
            val prefs = context.getSharedPreferences("smartpo_orders_storage", android.content.Context.MODE_PRIVATE)
            val ordersJson = SupabaseClient.gson.toJson(_orders.value)
            val itemsJson = SupabaseClient.gson.toJson(savedOrderItems.toList())
            prefs.edit()
                .putString("saved_orders", ordersJson)
                .putString("saved_order_items", itemsJson)
                .apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun loadOrdersFromLocalAndCloud() {
        try {
            val context = com.example.smartpo.SmartPoApplication.instance
            val prefs = context.getSharedPreferences("smartpo_orders_storage", android.content.Context.MODE_PRIVATE)
            val ordersJson = prefs.getString("saved_orders", null)
            val itemsJson = prefs.getString("saved_order_items", null)

            if (!ordersJson.isNullOrEmpty()) {
                val listType = object : TypeToken<List<OrderEntity>>() {}.type
                val savedList: List<OrderEntity> = SupabaseClient.gson.fromJson(ordersJson, listType)
                _orders.value = savedList
            }

            if (!itemsJson.isNullOrEmpty()) {
                val itemsType = object : TypeToken<List<OrderItemEntity>>() {}.type
                val savedItemsList: List<OrderItemEntity> = SupabaseClient.gson.fromJson(itemsJson, itemsType)
                savedOrderItems.clear()
                savedOrderItems.addAll(savedItemsList)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val resp = SupabaseClient.get("/rest/v1/orders?select=*")
                if (resp.isNotEmpty()) {
                    val listType = object : TypeToken<List<OrderEntity>>() {}.type
                    val cloudOrders: List<OrderEntity> = SupabaseClient.gson.fromJson(resp, listType)
                    if (cloudOrders.isNotEmpty()) {
                        val merged = (_orders.value + cloudOrders).distinctBy { it.id.ifEmpty { it.order_number } }
                        _orders.value = merged
                        saveOrdersToLocalDisk()
                    }
                }
            } catch (e: Exception) {
                // Keep local disk orders if offline
            }
        }
    }

    fun getAllOrders(): Flow<List<OrderEntity>> = _orders

    suspend fun getOrderById(id: String): OrderEntity? {
        return _orders.value.find { it.id == id }
    }

    // UI compatibility
    suspend fun getOrderById(id: Long): OrderEntity? {
        return getOrderById(id.toString())
    }

    suspend fun getOrderItems(orderId: String): List<OrderItemEntity> {
        val saved = savedOrderItems.filter { it.order_id == orderId }
        if (saved.isNotEmpty()) return saved
        return selectedItems.filter { it.order_id == orderId }
    }

    // UI compatibility
    suspend fun getOrderItems(orderId: Long): List<OrderItemEntity> {
        return getOrderItems(orderId.toString())
    }

    fun addItemToOrder(itemId: String, productName: String, quantity: Int, price: Double, unit: String) {
        val existing = selectedItems.find { it.product_name == productName }
        if (existing != null) {
            val idx = selectedItems.indexOf(existing)
            selectedItems[idx] = existing.copy(quantity = existing.quantity + quantity, total_price = (existing.quantity + quantity) * price)
        } else {
            selectedItems.add(OrderItemEntity(
                product_name = productName,
                quantity = quantity,
                unit_price = price,
                total_price = quantity * price,
                unit = unit,
                itemId = itemId
            ))
        }
    }

    // UI Compatibility
    fun addItemToOrder(itemId: Long, quantity: Int, price: Double) {
        addItemToOrder(itemId.toString(), "Item $itemId", quantity, price, "kg")
    }

    fun removeItemFromOrder(itemId: String) {
        selectedItems.removeAll { it.itemId == itemId }
    }

    // UI Compatibility
    fun removeItemFromOrder(itemId: Long) {
        removeItemFromOrder(itemId.toString())
    }

    fun updateItemInOrder(itemId: String, quantity: Int, price: Double) {
        val item = selectedItems.find { it.itemId == itemId }
        if (item != null) {
            val idx = selectedItems.indexOf(item)
            selectedItems[idx] = item.copy(quantity = quantity, unit_price = price, total_price = quantity * price)
        }
    }

    // UI Compatibility
    fun updateItemInOrder(itemId: Long, quantity: Int, price: Double) {
        updateItemInOrder(itemId.toString(), quantity, price)
    }

    fun getTotalAmount(): Double {
        return selectedItems.sumOf { it.quantity * it.unit_price }
    }

    fun submitOrder(onSubmitSuccess: (Long) -> Unit) {
        viewModelScope.launch {
            val total = getTotalAmount()
            val orderId = UUID.randomUUID().toString()
            
            try {
                // Post order to Supabase
                val orderJson = """
                {
                    "id": "$orderId",
                    "order_number": "${poNumber.replace('"', '"')}",
                    "customer_name": "${customerName.replace('"', '"')}",
                    "company_name": "${companyName.replace('"', '"')}",
                    "customer_phone": "$customerPhone",
                    "customer_address": "$customerAddress",
                    "total_amount": $total,
                    "notes": "${notes.replace('"', '"')}"
                }
                """.trimIndent()
                
                SupabaseClient.post("/rest/v1/orders", orderJson)
                
                // Post order items to Supabase
                selectedItems.forEach { item ->
                    val itemJson = """
                    {
                        "order_id": "$orderId",
                        "product_name": "${item.product_name.replace('"', '"')}",
                        "quantity": ${item.quantity},
                        "unit_price": ${item.unit_price},
                        "total_price": ${item.total_price},
                        "unit": "${item.unit}"
                    }
                    """.trimIndent()
                    SupabaseClient.post("/rest/v1/order_items", itemJson)
                }
            } catch (e: Exception) {
                // Keep local fallback
            }

            val newOrder = OrderEntity(
                id = orderId,
                order_number = poNumber,
                customer_name = customerName,
                company_name = companyName,
                total_amount = total
            )

            // Save items to local memory fallback list
            selectedItems.forEach { item ->
                savedOrderItems.add(item.copy(order_id = orderId))
            }

            val current = _orders.value.toMutableList()
            current.add(newOrder)
            _orders.value = current
            saveOrdersToLocalDisk()
            
            // Clear current selection
            poNumber = "PO-${System.currentTimeMillis().toString().takeLast(6)}-${(1000..9999).random()}"
            customerName = ""
            companyName = "SmartPO Industrial Corp"
            customerEmail = ""
            customerPhone = ""
            customerAddress = ""
            notes = ""
            selectedItems.clear()
            
            onSubmitSuccess(1L) // return dummy numeric ID to pass screen routing
        }
    }

    fun deleteOrder(orderId: String) {
        val current = _orders.value.toMutableList()
        current.removeAll { it.id == orderId }
        _orders.value = current
        saveOrdersToLocalDisk()
    }

    fun updateOrder(updated: OrderEntity) {
        val current = _orders.value.toMutableList()
        val index = current.indexOfFirst { it.id == updated.id }
        if (index != -1) {
            current[index] = updated
            _orders.value = current
            saveOrdersToLocalDisk()
        }
    }

    fun createDirectOrder(poNo: String, custName: String, itemName: String, qty: Int, price: Double, unit: String) {
        val total = qty * price
        val orderId = UUID.randomUUID().toString()
        val order = OrderEntity(
            id = orderId,
            order_number = poNo,
            customer_name = custName,
            total_amount = total
        )
        val current = _orders.value.toMutableList()
        current.add(order)
        _orders.value = current
        
        // Save order item
        val item = OrderItemEntity(
            order_id = orderId,
            product_name = itemName,
            quantity = qty,
            unit_price = price,
            total_price = total,
            unit = unit,
            itemId = UUID.randomUUID().toString()
        )
        selectedItems.add(item)
        savedOrderItems.add(item)
        saveOrdersToLocalDisk()
    }

    fun parseOrderWithAi(text: String, catalogList: List<com.example.smartpo.data.database.ItemEntity>) {
        _aiIsLoading.value = true
        _aiError.value = null
        
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val catalogJson = SupabaseClient.gson.toJson(catalogList)
                val prompt = """
                    You are an intelligent purchasing assistant. Your job is to match a user's plain text order request against our product catalog.
                    
                    Catalog JSON:
                    ${"$"}{catalogJson}
                    
                    User Order Request:
                    "$text"
                    
                    Instructions:
                    1. Analyze the user order request. Break it down into individual items (with names and quantities requested).
                    2. For each requested item, search the Catalog JSON for a matching product. 
                       - A match is successful if the product name closely represents the user's request.
                    3. Respond ONLY with a valid JSON array of objects. Do not wrap the JSON in markdown blocks or write any explanation text.
                    4. Each object in the JSON array must contain exactly these fields:
                       - "itemId": The "id" of the matched product from the Catalog (String). Use empty string "" if no match is found.
                       - "product_name": The exact "name" of the matched product from the Catalog (String). If not found, use the user's requested item name.
                       - "requested_name": The raw name of the item as described by the user (String).
                       - "quantity": The requested quantity (Integer). Default to 1 if not specified.
                       - "unit_price": The "price_per_kg" (or price) of the matched product from the Catalog (Double). Use 0.0 if not found.
                       - "unit": The "unit" of the matched product (String). Default to "pcs" if not found.
                       - "is_available": Boolean (true if matched in catalog, false if not found in catalog).
                """.trimIndent()

                val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=$GEMINI_API_KEY"
                
                val contentJson = JsonObject().apply {
                    val contentsArray = com.google.gson.JsonArray().apply {
                        add(JsonObject().apply {
                            add("parts", com.google.gson.JsonArray().apply {
                                add(JsonObject().apply {
                                    addProperty("text", prompt)
                                })
                            })
                        })
                    }
                    add("contents", contentsArray)
                }

                val body = SupabaseClient.gson.toJson(contentJson).toRequestBody("application/json".toMediaTypeOrNull())
                val request = Request.Builder()
                    .url(url)
                    .post(body)
                    .build()

                geminiClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) throw IOException("Failed to communicate with Gemini API: $response")
                    val responseStr = response.body?.string() ?: ""
                    val jsonResponse = SupabaseClient.gson.fromJson(responseStr, JsonObject::class.java)
                    
                    val responseText = jsonResponse.getAsJsonArray("candidates")
                        .get(0).asJsonObject
                        .getAsJsonObject("content")
                        .getAsJsonArray("parts")
                        .get(0).asJsonObject
                        .getAsJsonPrimitive("text").asString.trim()

                    val cleanJson = if (responseText.startsWith("```json")) {
                        responseText.substringAfter("```json").substringBefore("```").trim()
                    } else if (responseText.startsWith("```")) {
                        responseText.substringAfter("```").substringBefore("```").trim()
                    } else {
                        responseText
                    }

                    val listType = object : TypeToken<List<AiMatchedItem>>() {}.type
                    val foundItems: List<AiMatchedItem> = SupabaseClient.gson.fromJson(cleanJson, listType)
                    
                    viewModelScope.launch {
                        try {
                            _aiFoundItems.value = foundItems
                            // Add only matched/available items to the order selection automatically
                            foundItems.forEach { item ->
                                if (item.is_available) {
                                    val cleanId = item.itemId ?: ""
                                    val cleanName = item.product_name ?: "Unknown"
                                    val cleanQty = item.quantity ?: 1
                                    val cleanPrice = item.unit_price ?: 0.0
                                    val cleanUnit = item.unit ?: "pcs"
                                    addItemToOrder(cleanId, cleanName, cleanQty, cleanPrice, cleanUnit)
                                }
                            }
                        } catch (innerEx: Exception) {
                            _aiError.value = "Failed to load parsed items: " + innerEx.message
                        }
                    }
                }
            } catch (e: Exception) {
                viewModelScope.launch {
                    _aiError.value = "AI Parsing failed: " + e.message
                }
            } finally {
                viewModelScope.launch {
                    _aiIsLoading.value = false
                }
            }
        }
    }
}

data class AiMatchedItem(
    val itemId: String? = "",
    val product_name: String? = "",
    val requested_name: String? = "",
    val quantity: Int? = 1,
    val unit_price: Double? = 0.0,
    val unit: String? = "pcs",
    val is_available: Boolean = false
)
