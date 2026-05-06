plugins {
    // This is an aggregator module — no plugins needed
}

// ─── Run the monolithic application (backend serves frontend static files) ───
tasks.register<GradleBuild>("run") {
    group = "application"
    description = "Run the full monolithic application (backend + frontend)"
    dir = rootDir
    tasks = listOf(":app:backend:run")
    startParameter.projectProperties = startParameter.projectProperties + mapOf(
        "app.env" to ((findProperty("app.env") as? String) ?: "development"),
        "includeFrontend" to "true"
    )
}

// ─── Release: build fat JAR with everything ───
tasks.register<GradleBuild>("release") {
    group = "build"
    description = "Build release fat JAR (frontend + backend + all modules)"
    dir = rootDir
    tasks = listOf(":app:backend:fatJar")
}

// ─── Clean everything ───
tasks.register<Delete>("clean") {
    group = "build"
    description = "Clean all build outputs"
    delete("${rootDir}/app/frontend/dist")
    delete("${rootDir}/app/backend/build")
    delete("${rootDir}/app/backend/src/main/resources/static")
}
