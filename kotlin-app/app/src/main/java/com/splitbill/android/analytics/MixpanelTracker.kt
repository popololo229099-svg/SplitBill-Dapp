package com.splitbill.android.analytics

import android.content.Context
import com.mixpanel.android.mpmetrics.MixpanelAPI
import com.splitbill.android.Config
import org.json.JSONObject

class MixpanelTracker(context: Context) {

    private val mixpanel: MixpanelAPI =
        MixpanelAPI.getInstance(context.applicationContext, Config.MIXPANEL_TOKEN, false)

    fun identify(userId: String) {
        mixpanel.identify(userId)
    }

    fun reset() {
        mixpanel.reset()
    }

    fun track(event: String, properties: Map<String, Any?>) {
        val props = JSONObject()
        properties.forEach { (key, value) ->
            when (value) {
                is String -> props.put(key, value)
                is Number -> props.put(key, value)
                is Boolean -> props.put(key, value)
                else -> props.put(key, value?.toString())
            }
        }
        mixpanel.track(event, props)
    }
}
