rootProject.name = "shadmin"

pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
    versionCatalogs {
        create("ktorLibs").from("io.ktor:ktor-version-catalog:3.4.0")
    }
}

// App module (monolithic aggregator)
include("app")
include("app:frontend")
include("app:backend")

// Core infrastructure
include("core")

// Functional modules (SPI-discovered)
include("modules:auth")
include("modules:system")
include("modules:profile")
include("modules:resource")
