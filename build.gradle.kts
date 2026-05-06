plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(ktorLibs.plugins.ktor) apply false
    alias(libs.plugins.kotlin.kapt) apply false
}

allprojects {
    group = "com.shadmin"
    version = "0.1.0"
}
