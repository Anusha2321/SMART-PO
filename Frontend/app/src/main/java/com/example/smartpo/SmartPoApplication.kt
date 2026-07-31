package com.example.smartpo

import android.app.Application

class SmartPoApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: SmartPoApplication
            private set
    }
}
