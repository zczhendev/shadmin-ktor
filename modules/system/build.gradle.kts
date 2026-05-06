plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.kotlin.kapt)
}

dependencies {
    implementation(project(":core"))

    // Ktor
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.auth)
    implementation(ktorLibs.server.auth.jwt)

    // Exposed (for repository implementations)
    implementation(libs.bundles.exposed)

    // AutoService
    implementation(libs.bundles.autoservice)
    kapt(libs.autoservice)
}

kotlin {
    jvmToolchain(libs.versions.jvm.toolchain.get().toInt())
}
