plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.splitbill.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.splitbill.android"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField("String", "STELLAR_CONTRACT", "\"CBPZMTQ46FGY32Q3WPSORPIAW46Q2BLP5WAU2TJCSDQCOSR4TN5XFG62\"")
        buildConfigField("String", "STELLAR_HORIZON", "\"https://horizon-testnet.stellar.org\"")
        buildConfigField("String", "STELLAR_RPC", "\"https://soroban-testnet.stellar.org\"")
        buildConfigField("String", "API_BASE_URL", "\"https://splitbill-h0q9.onrender.com\"")
        buildConfigField("String", "MIXPANEL_TOKEN", "\"d89803ed4879e7ea62e0ff89cbd2cbbf\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "META-INF/versions/9/OSGI-INF/MANIFEST.MF"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)

    implementation(libs.androidx.security.crypto)
    implementation(libs.mixpanel.android)
    implementation(libs.stellar.sdk)

    debugImplementation(libs.androidx.ui.tooling)
}
