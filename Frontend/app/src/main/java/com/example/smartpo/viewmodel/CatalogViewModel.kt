package com.example.smartpo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartpo.data.database.ItemEntity
import com.example.smartpo.network.SupabaseClient
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class CatalogViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<ItemEntity>>(emptyList())

    init {
        loadCatalog()
    }

    private fun loadCatalog() {
        viewModelScope.launch {
            try {
                val responseStr = SupabaseClient.get("/rest/v1/products?select=*")
                val itemType = object : TypeToken<List<ItemEntity>>() {}.type
                val fetchedItems: List<ItemEntity> = SupabaseClient.gson.fromJson(responseStr, itemType)
                if (fetchedItems.isNotEmpty()) {
                    _items.value = fetchedItems
                } else {
                    loadFromAssets()
                }
            } catch (e: Exception) {
                loadFromAssets()
            }
        }
    }

    private fun loadFromAssets() {
        try {
            val jsonString = com.example.smartpo.SmartPoApplication.instance.assets.open("products.json")
                .bufferedReader().use { it.readText() }
            val itemType = object : TypeToken<List<ItemEntity>>() {}.type
            val fallbackItems: List<ItemEntity> = SupabaseClient.gson.fromJson(jsonString, itemType)
            _items.value = fallbackItems
        } catch (assetEx: Exception) {
            // Backup hardcoded mock list if assets read fails
            _items.value = listOf(
                ItemEntity("1", "1\" B/W Semi S/L Elbow SCH 40", "MS BENDS", 280.0, "pcs"),
                ItemEntity("2", "1\" Plastic Bend", "OTHERS", 100.0, "pcs"),
                ItemEntity("3", "16mm Ply Wood 8''X4''", "OTHERS", 7424.0, "sheets"),
                ItemEntity("4", "1850/U Type Heaters", "OTHERS", 37000.0, "pcs")
            )
        }
    }

    fun getAllItems(): Flow<List<ItemEntity>> = _items

    fun getItemsByCategory(category: String): Flow<List<ItemEntity>> {
        val filtered = MutableStateFlow<List<ItemEntity>>(emptyList())
        viewModelScope.launch {
            _items.collect { list ->
                filtered.value = list.filter { it.category.equals(category, ignoreCase = true) }
            }
        }
        return filtered
    }

    suspend fun getItemById(id: String): ItemEntity? {
        return _items.value.find { it.id == id }
    }

    // UI fallback for EditItemScreen Long ID signature
    suspend fun getItemById(id: Long): ItemEntity? {
        return getItemById(id.toString())
    }

    fun addItem(name: String, category: String, description: String, price: Double, unit: String) {
        viewModelScope.launch {
            try {
                // We omit id so Postgres auto-generates gen_random_uuid()
                val json = """
                {
                    "name": "${name.replace('"', '"')}",
                    "category": "${category.replace('"', '"')}",
                    "price_per_kg": $price,
                    "unit": "$unit"
                }
                """.trimIndent()
                SupabaseClient.post("/rest/v1/products", json)
                loadCatalog()
            } catch (e: Exception) {
                // Add locally on failure
                val current = _items.value.toMutableList()
                val nextId = (current.size + 1).toString()
                current.add(ItemEntity(nextId, name, category, price, unit))
                _items.value = current
            }
        }
    }

    fun updateItem(item: ItemEntity) {
        viewModelScope.launch {
            val current = _items.value.toMutableList()
            val index = current.indexOfFirst { it.id == item.id }
            if (index != -1) {
                current[index] = item
                _items.value = current
            }
        }
    }
}
