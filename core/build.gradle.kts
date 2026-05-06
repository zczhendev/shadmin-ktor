plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    // Ktor (for types in SPI)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.config.yaml)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.auth)
    implementation(ktorLibs.server.auth.jwt)
    implementation(ktorLibs.server.cors)
    implementation(ktorLibs.server.statusPages)
    implementation(ktorLibs.server.callLogging)
    implementation(ktorLibs.server.defaultHeaders)

    // Exposed
    implementation(libs.bundles.exposed)

    // Database
    implementation(libs.bundles.database.drivers)
    implementation(libs.hikaricp)

    // JWT
    implementation(libs.java.jwt)

    // Password Hashing
    implementation(libs.bcrypt)

    // Logging
    implementation(libs.logback.classic)

    // AutoService
    implementation(libs.bundles.autoservice)
}

kotlin {
    jvmToolchain(libs.versions.jvm.toolchain.get().toInt())
}
