package com.example.smartpo.util

import android.content.Context
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

    fun getString(key: String): String {
        val lang = _currentLanguage.value
        return when (key) {
            "app_name" -> "SmartPO"
            
            "nav_home" -> when (lang) {
                AppLanguage.HINDI -> "होम"
                AppLanguage.TAMIL -> "முகப்பு"
                AppLanguage.TELUGU -> "హోమ్"
                AppLanguage.KANNADA -> "ಮುಖ್ಯಪುಟ"
                AppLanguage.MALAYALAM -> "ഹോം"
                AppLanguage.MARATHI -> "होम"
                AppLanguage.GUJARATI -> "હોમ"
                AppLanguage.BENGALI -> "হোম"
                else -> "Home"
            }
            
            "nav_orders" -> when (lang) {
                AppLanguage.HINDI -> "ऑर्डर इतिहास"
                AppLanguage.TAMIL -> "ஆர்டர் வரலாறு"
                AppLanguage.TELUGU -> "ఆర్డర్ హిస్టరీ"
                AppLanguage.KANNADA -> "ಆರ್ಡರ್ ಹಿಸ್ಟರಿ"
                AppLanguage.MALAYALAM -> "ഓർഡർ ഹിസ്റ്ററി"
                AppLanguage.MARATHI -> "ऑर्डर इतिहास"
                AppLanguage.GUJARATI -> "ઓર્ડર હિસ્ટ્રી"
                AppLanguage.BENGALI -> "অর্ডার ইতিহাস"
                else -> "Orders"
            }
            
            "nav_catalog" -> when (lang) {
                AppLanguage.HINDI -> "कैटलॉग"
                AppLanguage.TAMIL -> "பட்டியல்"
                AppLanguage.TELUGU -> "కాటలాగ్"
                AppLanguage.KANNADA -> "ಕ್ಯಾಟಲಾಗ್"
                AppLanguage.MALAYALAM -> "കാറ്റലോഗ്"
                AppLanguage.MARATHI -> "कॅटलॉग"
                else -> "Catalog"
            }
            
            "nav_profile" -> when (lang) {
                AppLanguage.HINDI -> "प्रोफाइल"
                AppLanguage.TAMIL -> "சுயவிவரம்"
                AppLanguage.TELUGU -> "ప్రొఫైల్"
                AppLanguage.KANNADA -> "ಪ್ರೊಫೈಲ್"
                AppLanguage.MALAYALAM -> "പ്രൊഫൈൽ"
                AppLanguage.MARATHI -> "प्रोफाइल"
                else -> "Profile"
            }

            "profile_settings" -> when (lang) {
                AppLanguage.HINDI -> "प्रोफ़ाइल सेटिंग्स"
                AppLanguage.TAMIL -> "சுயவிவர அமைப்புகள்"
                AppLanguage.TELUGU -> "ప్రొఫైల్ సెట్టింగ్‌లు"
                AppLanguage.KANNADA -> "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು"
                AppLanguage.MALAYALAM -> "പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ"
                AppLanguage.MARATHI -> "प्रोफाइल सेटिंग्ज"
                AppLanguage.GUJARATI -> "પ્રોફાઇલ સેટિંગ્સ"
                AppLanguage.BENGALI -> "প্রোফাইল সেটিংস"
                else -> "Profile Settings"
            }

            "edit_profile" -> when (lang) {
                AppLanguage.HINDI -> "प्रोफ़ाइल संपादित करें"
                AppLanguage.TAMIL -> "சுயவிவரத்தைத் திருத்து"
                AppLanguage.TELUGU -> "ప్రొఫైల్‌ను సవరించండి"
                AppLanguage.KANNADA -> "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ"
                AppLanguage.MALAYALAM -> "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക"
                AppLanguage.MARATHI -> "प्रोफाइल संपादित करा"
                else -> "Edit Profile"
            }

            "edit_profile_sub" -> when (lang) {
                AppLanguage.HINDI -> "अपना नाम और संपर्क विवरण बदलें"
                AppLanguage.TAMIL -> "உங்கள் பெயர் மற்றும் தொடர்பு விவரங்களை மாற்றவும்"
                AppLanguage.TELUGU -> "మీ పేరు మరియు సంప్రదింపు వివరాలను మార్చండి"
                AppLanguage.KANNADA -> "ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ"
                else -> "Change your name and contact details"
            }

            "change_password" -> when (lang) {
                AppLanguage.HINDI -> "पासवर्ड बदलें"
                AppLanguage.TAMIL -> "கடவுச்சொல்லை மாற்று"
                AppLanguage.TELUGU -> "పాస్‌వర్డ్‌ను మార్చండి"
                AppLanguage.KANNADA -> "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ"
                AppLanguage.MALAYALAM -> "പാസ്‌വേഡ് മാറ്റുക"
                AppLanguage.MARATHI -> "पासवर्ड बदला"
                else -> "Change Password"
            }

            "change_password_sub" -> when (lang) {
                AppLanguage.HINDI -> "अपनी सुरक्षा साख अपडेट करें"
                AppLanguage.TAMIL -> "உங்கள் பாதுகாப்பு சான்றுகளைப் புதுப்பிக்கவும்"
                AppLanguage.TELUGU -> "మీ భద్రతా ఆధారాలను నవీకరించండి"
                else -> "Update your security credentials"
            }

            "privacy_policy" -> when (lang) {
                AppLanguage.HINDI -> "गोपनीयता नीति"
                AppLanguage.TAMIL -> "தனியுரிமைக் கொள்கை"
                AppLanguage.TELUGU -> "గోప్యతా విధానం"
                AppLanguage.KANNADA -> "ಗೌಪ್ಯತಾ ನೀತಿ"
                else -> "Privacy Policy"
            }

            "privacy_policy_sub" -> when (lang) {
                AppLanguage.HINDI -> "समझें कि हम आपके डेटा की सुरक्षा कैसे करते हैं"
                AppLanguage.TAMIL -> "உங்கள் தரவை நாங்கள் எவ்வாறு பாதுகாக்கிறோம் என்பதைப் புரிந்து கொள்ளுங்கள்"
                AppLanguage.TELUGU -> "మేము మీ డేటాను ఎలా భద్రపరుస్తామో అర్థం చేసుకోండి"
                else -> "Understand how we protect your data"
            }

            "terms_conditions" -> when (lang) {
                AppLanguage.HINDI -> "नियम और शर्तें"
                AppLanguage.TAMIL -> "விதிகள் மற்றும் நிபந்தனைகள்"
                AppLanguage.TELUGU -> "నిబంధనలు & షరతులు"
                AppLanguage.KANNADA -> "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"
                else -> "Terms & Conditions"
            }

            "terms_conditions_sub" -> when (lang) {
                AppLanguage.HINDI -> "हमारे नियमों और सेवा समझौते की समीक्षा करें"
                AppLanguage.TAMIL -> "எங்கள் விதிகள் மற்றும் சேவை ஒப்பந்தத்தை மதிப்பாய்வு செய்யவும்"
                AppLanguage.TELUGU -> "మా నిబంధనలు మరియు సేవా ఒప్పందాన్ని సమీక్షించండి"
                else -> "Review our rules and service agreement"
            }

            "app_language" -> when (lang) {
                AppLanguage.HINDI -> "ऐप भाषा"
                AppLanguage.TAMIL -> "செயலி மொழி"
                AppLanguage.TELUGU -> "యాప్ భాష"
                AppLanguage.KANNADA -> "ಆಪ್ ಭಾಷೆ"
                else -> "App Language"
            }

            "logout" -> when (lang) {
                AppLanguage.HINDI -> "लॉग आउट करें"
                AppLanguage.TAMIL -> "வெளியேறு"
                AppLanguage.TELUGU -> "లాగ్ అవుట్"
                AppLanguage.KANNADA -> "ಲಾಗ್ ഔಟ್"
                AppLanguage.MALAYALAM -> "ലോഗ് ഔട്ട്"
                AppLanguage.MARATHI -> "लॉग आउट करा"
                else -> "Logout"
            }

            else -> key
        }
    }
}
