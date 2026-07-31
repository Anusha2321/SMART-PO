package com.example.smartpo.network

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

object SupabaseClient {
    private const val SUPABASE_URL = "https://jnnjzgwgqjncjeunfcis.supabase.co"
    // Use the publishable key prefix provided by user. User can replace this with full key if needed.
    private const val SUPABASE_KEY = "sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf"
    
    val client = OkHttpClient()
    val gson = Gson()
    
    var userToken: String? = null

    private fun getHeaders(): Headers {
        val builder = Headers.Builder()
            .add("apikey", SUPABASE_KEY)
            .add("Content-Type", "application/json")
        userToken?.let {
            builder.add("Authorization", "Bearer $it")
        } ?: run {
            builder.add("Authorization", "Bearer $SUPABASE_KEY")
        }
        return builder.build()
    }

    suspend fun get(path: String): String = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$SUPABASE_URL$path")
            .headers(getHeaders())
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("Unexpected code $response")
            response.body?.string() ?: ""
        }
    }

    suspend fun post(path: String, json: String): String = withContext(Dispatchers.IO) {
        val body = json.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val request = Request.Builder()
            .url("$SUPABASE_URL$path")
            .headers(getHeaders())
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("Unexpected code $response")
            response.body?.string() ?: ""
        }
    }
}
