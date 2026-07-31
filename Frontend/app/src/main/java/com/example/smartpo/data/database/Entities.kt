package com.example.smartpo.data.database

data class ItemEntity(
    val id: String = "",
    val name: String,
    val category: String,
    val price_per_kg: Double,
    val unit: String = "kg",
    @Transient val description: String = ""
) {
    // UI backward compatibility
    val price: Double get() = price_per_kg
    val pricePerKg: Double get() = price_per_kg
}

data class OrderEntity(
    val id: String = "",
    val order_number: String,
    val customer_name: String,
    val company_name: String = "SmartPO Industrial Corp",
    val customer_phone: String = "",
    val customer_address: String = "",
    val total_amount: Double,
    val status: String = "pending",
    val notes: String = "",
    val created_at: String = "",
    @Transient val dateMillis: Long = System.currentTimeMillis(),
    @Transient val pdfPath: String? = null,
    @Transient val excelPath: String? = null
) {
    // UI backward compatibility
    val poNumber: String get() = order_number
    val customerName: String get() = customer_name
    val companyName: String get() = company_name
    val customerEmail: String get() = ""
}

data class OrderItemEntity(
    val id: String = "",
    val order_id: String = "",
    val product_name: String,
    val quantity: Int,
    val unit_price: Double,
    val total_price: Double,
    val unit: String = "kg",
    @Transient val itemId: String = ""
) {
    // UI backward compatibility
    val unitPrice: Double get() = unit_price
}
