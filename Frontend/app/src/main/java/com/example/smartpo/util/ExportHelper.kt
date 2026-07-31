package com.example.smartpo.util

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.example.smartpo.data.database.OrderEntity
import com.example.smartpo.data.database.OrderItemEntity
import java.io.File
import java.io.FileOutputStream
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

object ExportHelper {

    fun formatRupee(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        return format.format(amount).replace("INR", "₹")
    }

    fun exportToPdf(context: Context, order: OrderEntity, items: List<OrderItemEntity>) {
        try {
            val pdfDocument = PdfDocument()
            val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
            val page = pdfDocument.startPage(pageInfo)
            val canvas: Canvas = page.canvas

            val titlePaint = Paint().apply {
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 20f
                color = Color.rgb(30, 58, 138)
            }

            val subtitlePaint = Paint().apply {
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 12f
                color = Color.rgb(100, 116, 139)
            }

            val headerPaint = Paint().apply {
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 12f
                color = Color.BLACK
            }

            val textPaint = Paint().apply {
                typeface = Typeface.DEFAULT
                textSize = 11f
                color = Color.rgb(51, 65, 85)
            }

            val boldPaint = Paint().apply {
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 11f
                color = Color.rgb(15, 23, 42)
            }

            val linePaint = Paint().apply {
                color = Color.rgb(226, 232, 240)
                strokeWidth = 1f
            }

            val headerBgPaint = Paint().apply {
                color = Color.rgb(241, 245, 249)
                style = Paint.Style.FILL
            }

            var y = 40f

            // Title Header
            canvas.drawText("PURCHASE ORDER INVOICE", 40f, y, titlePaint)
            y += 24f
            canvas.drawText("Company: ${order.company_name.ifBlank { "SmartPO Industrial Corp" }}", 40f, y, subtitlePaint)
            
            val dateStr = SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(Date(order.dateMillis))
            canvas.drawText("Date: $dateStr", 420f, y, textPaint)
            y += 20f

            canvas.drawLine(40f, y, 555f, y, linePaint)
            y += 20f

            // Order Metadata Box
            canvas.drawText("PO Number:", 40f, y, boldPaint)
            canvas.drawText(order.order_number, 130f, y, textPaint)
            y += 18f

            canvas.drawText("Customer:", 40f, y, boldPaint)
            canvas.drawText(order.customer_name, 130f, y, textPaint)
            y += 18f

            if (order.customer_phone.isNotBlank()) {
                canvas.drawText("Phone:", 40f, y, boldPaint)
                canvas.drawText(order.customer_phone, 130f, y, textPaint)
                y += 18f
            }

            if (order.customer_address.isNotBlank()) {
                canvas.drawText("Address:", 40f, y, boldPaint)
                canvas.drawText(order.customer_address, 130f, y, textPaint)
                y += 18f
            }

            canvas.drawText("Status:", 40f, y, boldPaint)
            canvas.drawText(order.status.uppercase(Locale.getDefault()), 130f, y, textPaint)
            y += 25f

            // Table Header Background
            canvas.drawRect(40f, y, 555f, y + 25f, headerBgPaint)
            y += 18f

            // Table Headers
            canvas.drawText("Item / Product", 50f, y, headerPaint)
            canvas.drawText("Qty", 300f, y, headerPaint)
            canvas.drawText("Unit Price", 380f, y, headerPaint)
            canvas.drawText("Total Amount", 470f, y, headerPaint)
            y += 12f
            canvas.drawLine(40f, y, 555f, y, linePaint)
            y += 20f

            // Table Content Rows
            items.forEach { item ->
                val name = if (item.product_name.length > 30) item.product_name.take(27) + "..." else item.product_name
                canvas.drawText(name, 50f, y, textPaint)
                canvas.drawText("${item.quantity} ${item.unit}", 300f, y, textPaint)
                canvas.drawText(formatRupee(item.unit_price), 380f, y, textPaint)
                canvas.drawText(formatRupee(item.total_price), 470f, y, textPaint)
                y += 20f
                canvas.drawLine(40f, y - 5f, 555f, y - 5f, linePaint)
            }

            y += 15f
            // Total Amount Summary
            canvas.drawRect(330f, y, 555f, y + 35f, headerBgPaint)
            y += 22f
            canvas.drawText("Grand Total:", 345f, y, boldPaint)
            canvas.drawText(formatRupee(order.total_amount), 445f, y, titlePaint.apply { textSize = 14f })

            pdfDocument.finishPage(page)

            val exportDir = File(context.cacheDir, "exports")
            if (!exportDir.exists()) exportDir.mkdirs()

            val pdfFile = File(exportDir, "PO_${order.order_number.replace("/", "_")}.pdf")
            val outputStream = FileOutputStream(pdfFile)
            pdfDocument.writeTo(outputStream)
            outputStream.close()
            pdfDocument.close()

            openOrShareFile(context, pdfFile, "application/pdf")
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Failed to export PDF: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    fun exportToExcel(context: Context, order: OrderEntity, items: List<OrderItemEntity>) {
        try {
            val dateStr = SimpleDateFormat("dd MMM yyyy HH:mm", Locale.getDefault()).format(Date(order.dateMillis))
            val csvContent = StringBuilder().apply {
                append("SMART PO - PURCHASE ORDER SUMMARY\n")
                append("Company Name,${escapeCsv(order.company_name.ifBlank { "SmartPO Industrial Corp" })}\n")
                append("PO Number,${escapeCsv(order.order_number)}\n")
                append("Customer Name,${escapeCsv(order.customer_name)}\n")
                append("Customer Phone,${escapeCsv(order.customer_phone)}\n")
                append("Customer Address,${escapeCsv(order.customer_address)}\n")
                append("Date,${escapeCsv(dateStr)}\n")
                append("Status,${escapeCsv(order.status)}\n")
                append("\n")
                append("Product Name,Quantity,Unit,Unit Price (INR),Total Price (INR)\n")
                
                items.forEach { item ->
                    append("${escapeCsv(item.product_name)},${item.quantity},${escapeCsv(item.unit)},${item.unit_price},${item.total_price}\n")
                }
                
                append("\n")
                append(",,,Grand Total (INR),${order.total_amount}\n")
            }.toString()

            val exportDir = File(context.cacheDir, "exports")
            if (!exportDir.exists()) exportDir.mkdirs()

            val csvFile = File(exportDir, "PO_${order.order_number.replace("/", "_")}.csv")
            csvFile.writeText(csvContent)

            openOrShareFile(context, csvFile, "text/csv")
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Failed to export Excel: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun escapeCsv(value: String): String {
        return if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            "\"" + value.replace("\"", "\"\"") + "\""
        } else {
            value
        }
    }

    private fun openOrShareFile(context: Context, file: File, mimeType: String) {
        val authority = "${context.packageName}.fileprovider"
        val uri: Uri = FileProvider.getUriForFile(context, authority, file)

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, mimeType)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        val chooserIntent = Intent.createChooser(intent, "Open or Share Order Document").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            context.startActivity(chooserIntent)
            Toast.makeText(context, "Exported successfully: ${file.name}", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(shareIntent, "Share Order Document").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        }
    }
}
