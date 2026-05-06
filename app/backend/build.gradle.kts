plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(ktorLibs.plugins.ktor)
    alias(libs.plugins.kotlin.kapt)
}

application {
    mainClass.set("io.ktor.server.netty.EngineMain")
    applicationDefaultJvmArgs = listOf("--enable-native-access=ALL-UNNAMED")
}

dependencies {
    // Core SPI + infrastructure
    implementation(project(":core"))

    // Modules — discovered at runtime via SPI
    implementation(project(":modules:auth"))
    implementation(project(":modules:system"))
    implementation(project(":modules:profile"))
    implementation(project(":modules:resource"))

    // Ktor
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.auth)
    implementation(ktorLibs.server.auth.jwt)
    implementation(ktorLibs.server.cors)
    implementation(ktorLibs.server.statusPages)
    implementation(ktorLibs.server.callLogging)
    implementation(ktorLibs.server.defaultHeaders)
    implementation(ktorLibs.server.config.yaml)

    // Exposed (needed because core exposes Database in its public API)
    implementation(libs.bundles.exposed)

    // Logging
    implementation(libs.logback.classic)
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(libs.versions.jvm.toolchain.get().toInt())
}

// ─── Copy frontend dist into backend resources/static ───
evaluationDependsOn(":app:frontend")

tasks.register<Copy>("copyFrontend") {
    group = "build"
    description = "Copy frontend build output into backend resources"
    dependsOn(project(":app:frontend").tasks.named("buildFrontend"))

    val frontendDist = rootProject.file("app/frontend/dist")
    val staticResources = file("src/main/resources/static")
    from(frontendDist)
    into(staticResources)
    onlyIf { frontendDist.exists() }

    doFirst {
        if (!frontendDist.exists()) {
            logger.warn("Frontend dist not found. Run ':app:frontend:buildFrontend' first.")
        } else {
            delete(staticResources)
            logger.lifecycle("Copying frontend dist to ${staticResources.absolutePath}")
        }
    }
}

// ─── Clean frontend static files when running backend-only ───
tasks.register<Delete>("cleanStatic") {
    group = "build"
    description = "Remove frontend static files from backend resources"
    delete(file("src/main/resources/static"))
}

// Only bundle frontend when building the full app (:app:run) or distribution artifacts.
// :app:backend:run skips frontend build for faster backend-only development.
val includeFrontend = project.findProperty("includeFrontend") == "true"

// Distribution tasks (fatJar, build, assemble) should always include frontend
val distTasks = setOf(
    ":app:backend:fatJar", "fatJar",
    ":app:backend:build", "build",
    ":app:backend:assemble", "assemble"
)
val isDistBuild = gradle.startParameter.taskNames.any { it in distTasks }

tasks.named("processResources") {
    if (includeFrontend || isDistBuild) {
        dependsOn("copyFrontend")
    } else {
        dependsOn("cleanStatic")
    }
}

// Fat JAR — always includes frontend (processResources depends on copyFrontend when isDistBuild)
tasks.register<Jar>("fatJar") {
    group = "build"
    description = "Create fat JAR with all modules and frontend"
    dependsOn("build")
    archiveClassifier.set("all")
    from(sourceSets.main.get().output)
    dependsOn(configurations.runtimeClasspath)
    from({ configurations.runtimeClasspath.get().filter { it.name.endsWith("jar") }.map { zipTree(it) } })
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    manifest { attributes["Main-Class"] = "io.ktor.server.netty.EngineMain" }
}
