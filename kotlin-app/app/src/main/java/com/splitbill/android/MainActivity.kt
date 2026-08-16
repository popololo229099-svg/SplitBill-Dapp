package com.splitbill.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.splitbill.android.ui.navigation.AppRoot
import com.splitbill.android.ui.theme.SplitBillTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SplitBillTheme {
                AppRoot()
            }
        }
    }
}
