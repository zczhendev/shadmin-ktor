plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.kotlin.kapt)
}

dependencies {
    implementation(project(":core"))
    implementation(project(":modules:system"))

    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.auth)
    implementation(ktorLibs.server.auth.jwt)

    implementation(libs.bundles.autoservice)
    kapt(libs.autoservice)
}

kotlin {
    jvmToolchain(libs.versions.jvm.toolchain.get().toInt())
}
