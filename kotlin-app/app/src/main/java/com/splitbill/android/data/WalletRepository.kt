package com.splitbill.android.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class WalletRepository(context: Context) {

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "splitbill_secure",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun getSecret(): String? = prefs.getString(KEY_SECRET, null)

    fun setSecret(secret: String) {
        prefs.edit().putString(KEY_SECRET, secret).apply()
    }

    fun clear() {
        prefs.edit().remove(KEY_SECRET).apply()
    }

    private companion object {
        const val KEY_SECRET = "stellar_secret_seed"
    }
}
