package com.example.smartpo.util

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppLanguage(val code: String, val displayName: String) {
    ENGLISH("en", "English"),
    HINDI("hi", "हिंदी (Hindi)"),
    TAMIL("ta", "தமிழ் (Tamil)"),
    TELUGU("te", "తెలుగు (Telugu)"),
    KANNADA("kn", "ಕನ್ನಡ (Kannada)"),
    MALAYALAM("ml", "മലയാളം (Malayalam)"),
    MARATHI("mr", "मराठी (Marathi)"),
    GUJARATI("gu", "ગુજરાતી (Gujarati)"),
    BENGALI("bn", "বাংলা (Bengali)"),
    PUNJABI("pa", "ਪੰਜਾਬੀ (Punjabi)"),
    SPANISH("es", "Español (Spanish)"),
    FRENCH("fr", "Français (French)"),
    GERMAN("de", "Deutsch (German)"),
    ARABIC("ar", "العربية (Arabic)")
}

object LanguageManager {
    private const val PREFS_NAME = "smartpo_language_prefs"
    private const val KEY_LANG = "selected_language"

    private val _currentLanguage = MutableStateFlow(AppLanguage.ENGLISH)
    val currentLanguage: StateFlow<AppLanguage> = _currentLanguage.asStateFlow()

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val langCode = prefs.getString(KEY_LANG, AppLanguage.ENGLISH.code) ?: AppLanguage.ENGLISH.code
        _currentLanguage.value = AppLanguage.values().find { it.code == langCode } ?: AppLanguage.ENGLISH
    }

    fun setLanguage(context: Context, language: AppLanguage) {
        _currentLanguage.value = language
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_LANG, language.code).apply()
        updateAppLocale(context, language)
    }

    fun updateAppLocale(context: Context, language: AppLanguage) {
        try {
            val locale = java.util.Locale(language.code)
            java.util.Locale.setDefault(locale)
            val resources = context.resources
            val config = android.content.res.Configuration(resources.configuration)
            config.setLocale(locale)
            resources.updateConfiguration(config, resources.displayMetrics)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Full Localized Dictionary supporting All Languages
    fun getString(key: String): String {
        val lang = _currentLanguage.value
        return when (key) {
            "app_name" -> "SmartPO"
            "welcome_title" -> when (lang) {
                AppLanguage.HINDI -> "स्मार्ट पीओ में आपका स्वागत है"
                AppLanguage.TAMIL -> "ஸ்மார்ட் PO உங்களை வரவேற்கிறது"
                AppLanguage.TELUGU -> "స్మార్ట్ PO కి స్వాగతం"
                AppLanguage.KANNADA -> "ಸ್ಮಾರ್ಟ್ PO ಗೆ ಸ್ವಾಗತ"
                AppLanguage.MALAYALAM -> "സ്മാർട്ട് PO-ലേക്ക് സ്വാഗതം"
                AppLanguage.MARATHI -> "स्मार्ट पीओ मध्ये आपले स्वागत आहे"
                AppLanguage.GUJARATI -> "સ્માર્ટ PO માં આપનું સ્વાગત છે"
                AppLanguage.BENGALI -> "স্মার্ট PO তে স্বাগতম"
                AppLanguage.PUNJABI -> "ਸਮਾਰਟ PO ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ"
                AppLanguage.SPANISH -> "Bienvenido a SmartPO"
                AppLanguage.FRENCH -> "Bienvenue sur SmartPO"
                AppLanguage.GERMAN -> "Willkommen bei SmartPO"
                AppLanguage.ARABIC -> "مرحباً بك في SmartPO"
                else -> "Welcome to SmartPO"
            }
            "welcome_subtitle" -> when (lang) {
                AppLanguage.HINDI -> "स्मार्ट खरीद आदेश प्रबंधन और सूची प्रणाली"
                AppLanguage.TAMIL -> "கொள்முதல் ஆணை மேலாண்மை மற்றும் தயாரிப்பு மேலாண்மை"
                AppLanguage.TELUGU -> "కొనుగోలు ఆర్డర్ నిర్వహణ మరియు కెటలాగ్ సిస్టమ్"
                AppLanguage.KANNADA -> "ಖರೀದಿ ಆದೇಶ ನಿರ್ವಹಣೆ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ವ್ಯವಸ್ಥೆ"
                AppLanguage.MALAYALAM -> "സ്മാർട്ട് പർച്ചേസ് ഓർഡർ മാനേജ്മെന്റ് സിസ്റ്റം"
                AppLanguage.MARATHI -> "स्मार्ट खरेदी ऑर्डर व्यवस्थापन प्रणाली"
                AppLanguage.GUJARATI -> "સ્માર્ટ ખરીદી ઓર્ડર સંચાલન સિસ્ટમ"
                AppLanguage.BENGALI -> "স্মার্ট ক্রয় আদেশ ব্যবস্থাপনা সিস্টেম"
                AppLanguage.PUNJABI -> "ਸਮਾਰਟ ਖਰੀਦ ਆਰਡਰ ਪ੍ਰਬੰਧਨ ਪ੍ਰਣਾਲੀ"
                AppLanguage.SPANISH -> "Gestión Inteligente de Órdenes de Compra"
                AppLanguage.FRENCH -> "Gestion Intelligente des Bons de Commande"
                AppLanguage.GERMAN -> "Intelligente Bestellschein-Verwaltung"
                AppLanguage.ARABIC -> "إدارة أوامر الشراء الذكية"
                else -> "Smart Purchase Order Management & Catalog System"
            }
            "login" -> when (lang) {
                AppLanguage.HINDI -> "लॉगिन करें"
                AppLanguage.TAMIL -> "உள்நுழைக"
                AppLanguage.TELUGU -> "లాగిన్ చేయండి"
                AppLanguage.KANNADA -> "ಲಾಗಿನ್ ಮಾಡಿ"
                AppLanguage.MALAYALAM -> "ലോഗിൻ ചെയ്യുക"
                AppLanguage.MARATHI -> "लॉगिन करा"
                AppLanguage.GUJARATI -> "લોગિન કરો"
                AppLanguage.BENGALI -> "লগইন করুন"
                AppLanguage.PUNJABI -> "ਲਾਗਇਨ ਕਰੋ"
                AppLanguage.SPANISH -> "Iniciar Sesión"
                AppLanguage.FRENCH -> "Se Connecter"
                AppLanguage.GERMAN -> "Anmelden"
                AppLanguage.ARABIC -> "تسجيل الدخول"
                else -> "Login"
            }
            "sign_up" -> when (lang) {
                AppLanguage.HINDI -> "साइन अप करें"
                AppLanguage.TAMIL -> "பதிவு செய்க"
                AppLanguage.TELUGU -> "సైన్ అప్ చేయండి"
                AppLanguage.KANNADA -> "ಸೈನ್ ಅಪ್ ಮಾಡಿ"
                AppLanguage.MALAYALAM -> "സൈൻ അപ്പ് ചെയ്യുക"
                AppLanguage.MARATHI -> "साइन अप करा"
                AppLanguage.GUJARATI -> "સાઇન અપ કરો"
                AppLanguage.BENGALI -> "সাইন আপ করুন"
                AppLanguage.PUNJABI -> "ਸਾਈਨ ਅੱਪ ਕਰੋ"
                AppLanguage.SPANISH -> "Registrarse"
                AppLanguage.FRENCH -> "S'inscrire"
                AppLanguage.GERMAN -> "Registrieren"
                AppLanguage.ARABIC -> "إنشاء حساب"
                else -> "Sign Up"
            }
            "customer_name" -> when (lang) {
                AppLanguage.HINDI -> "ग्राहक का नाम"
                AppLanguage.TAMIL -> "வாடிக்கையாளர் பெயர்"
                AppLanguage.TELUGU -> "వినియోగదారుని పేరు"
                AppLanguage.KANNADA -> "ಗ್ರಾಹಕರ ಹೆಸರು"
                AppLanguage.MALAYALAM -> "ഉപഭോക്താവിന്റെ പേര്"
                AppLanguage.MARATHI -> "ग्राहकाचे नाव"
                AppLanguage.GUJARATI -> "ગ્રાહકનું નામ"
                AppLanguage.BENGALI -> "গ্রাহকের নাম"
                AppLanguage.PUNJABI -> "ਗਾਹਕ ਦਾ ਨਾਮ"
                AppLanguage.SPANISH -> "Nombre del Cliente"
                AppLanguage.FRENCH -> "Nom du Client"
                AppLanguage.GERMAN -> "Kundenname"
                AppLanguage.ARABIC -> "اسم العميل"
                else -> "Customer Name"
            }
            "company_name" -> when (lang) {
                AppLanguage.HINDI -> "कंपनी का नाम"
                AppLanguage.TAMIL -> "நிறுவனத்தின் பெயர்"
                AppLanguage.TELUGU -> "సంస్థ పేరు"
                AppLanguage.KANNADA -> "ಸಂಸ್ಥೆಯ ಹೆಸರು"
                AppLanguage.MALAYALAM -> "കമ്പനിയുടെ പേര്"
                AppLanguage.MARATHI -> "कंपनीचे नाव"
                AppLanguage.GUJARATI -> "કંપનીનું નામ"
                AppLanguage.BENGALI -> "কোম্পানির নাম"
                AppLanguage.PUNJABI -> "ਕੰਪਨੀ ਦਾ ਨਾਮ"
                AppLanguage.SPANISH -> "Nombre de la Empresa"
                AppLanguage.FRENCH -> "Nom de la Société"
                AppLanguage.GERMAN -> "Firmenname"
                AppLanguage.ARABIC -> "اسم الشركة"
                else -> "Company Name"
            }
            "pdf_export" -> when (lang) {
                AppLanguage.HINDI -> "पीडीएफ निर्यात"
                AppLanguage.TAMIL -> "PDF ஏற்றுமதி"
                AppLanguage.TELUGU -> "PDF ఎగుమతి"
                AppLanguage.KANNADA -> "PDF ರಫ್ತು"
                AppLanguage.MALAYALAM -> "PDF എക്സ്പോർട്ട്"
                AppLanguage.MARATHI -> "PDF एक्सपोर्ट"
                AppLanguage.GUJARATI -> "PDF એક્સપોર્ટ"
                AppLanguage.BENGALI -> "PDF এক্সপোর্ট"
                AppLanguage.PUNJABI -> "PDF ਐਕਸਪੋਰਟ"
                AppLanguage.SPANISH -> "Exportar PDF"
                AppLanguage.FRENCH -> "Exporter en PDF"
                AppLanguage.GERMAN -> "PDF Exportieren"
                AppLanguage.ARABIC -> "تصدير PDF"
                else -> "PDF Export"
            }
            "excel_export" -> when (lang) {
                AppLanguage.HINDI -> "एक्सेल निर्यात"
                AppLanguage.TAMIL -> "Excel ஏற்றுமதி"
                AppLanguage.TELUGU -> "Excel ఎగుమతి"
                AppLanguage.KANNADA -> "Excel ರಫ್ತು"
                AppLanguage.MALAYALAM -> "Excel എക്സ്പോർട്ട്"
                AppLanguage.MARATHI -> "Excel एक्सपोर्ट"
                AppLanguage.GUJARATI -> "Excel એક્સપોર્ટ"
                AppLanguage.BENGALI -> "Excel এক্সপোর্ট"
                AppLanguage.PUNJABI -> "Excel ਐਕਸਪੋਰਟ"
                AppLanguage.SPANISH -> "Exportar Excel"
                AppLanguage.FRENCH -> "Exporter en Excel"
                AppLanguage.GERMAN -> "Excel Exportieren"
                AppLanguage.ARABIC -> "تصدير Excel"
                else -> "Excel Export"
            }
            "select_language" -> when (lang) {
                AppLanguage.HINDI -> "भाषा चुनें"
                AppLanguage.TAMIL -> "மொழியைத் தேர்ந்தெடுக்கவும்"
                AppLanguage.TELUGU -> "భాషను ఎంచుకోండి"
                AppLanguage.KANNADA -> "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
                AppLanguage.MALAYALAM -> "ഭാഷ തിരഞ്ഞെടുക്കുക"
                AppLanguage.MARATHI -> "भाषा निवडा"
                AppLanguage.GUJARATI -> "ભાષા પસંદ કરો"
                AppLanguage.BENGALI -> "ভাষা নির্বাচন করুন"
                AppLanguage.PUNJABI -> "ਭਾਸ਼ਾ ਚੁਣੋ"
                AppLanguage.SPANISH -> "Seleccionar Idioma"
                AppLanguage.FRENCH -> "Sélectionner la Langue"
                AppLanguage.GERMAN -> "Sprache Auswählen"
                AppLanguage.ARABIC -> "اختر اللغة"
                else -> "Select App Language"
            }
            "search_catalog" -> when (lang) {
                AppLanguage.MARATHI -> "श्रेणी किंवा वस्तू शोधा..."
                AppLanguage.HINDI -> "श्रेणियां या आइटम खोजें..."
                AppLanguage.TAMIL -> "பொருட்களைத் தேடுங்கள்..."
                AppLanguage.TELUGU -> "ఉత్పత్తులను వెతకండి..."
                AppLanguage.GERMAN -> "Kategorien oder Artikel suchen..."
                else -> "Search categories or products..."
            }
            else -> key
        }
    }
}
