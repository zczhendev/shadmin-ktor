plugins {
    base
}

val pnpmCmd = if (System.getProperty("os.name").lowercase().contains("windows")) "pnpm.cmd" else "pnpm"

// Check if pnpm is available
fun Project.hasPnpm(): Boolean {
    return try {
        val proc = ProcessBuilder(pnpmCmd, "--version").start()
        proc.waitFor()
        proc.exitValue() == 0
    } catch (e: Exception) {
        false
    }
}

// Install frontend dependencies
tasks.register<Exec>("pnpmInstall") {
    group = "frontend"
    description = "Install frontend dependencies with pnpm"
    workingDir = projectDir
    inputs.files("package.json", "pnpm-lock.yaml")
    outputs.dir("node_modules")
    outputs.cacheIf { true }

    if (!hasPnpm()) {
        doFirst {
            logger.warn("pnpm not found. Install pnpm: npm install -g pnpm")
            throw GradleException("pnpm is required but not found. Install it with: npm install -g pnpm")
        }
    }

    commandLine(pnpmCmd, "install", "--frozen-lockfile")

    // Only run if node_modules doesn't exist or lockfile changed
    outputs.upToDateWhen {
        file("node_modules/.package-lock.json").exists() ||
        file("node_modules/.modules.yaml").exists()
    }
}

// Build frontend for production
tasks.register<Exec>("buildFrontend") {
    group = "frontend"
    description = "Build frontend for production"
    workingDir = projectDir
    dependsOn("pnpmInstall")

    inputs.dir("src")
    inputs.files("package.json", "vite.config.ts", "index.html", "tsconfig.json")
    outputs.dir("dist")

    commandLine(pnpmCmd, "run", "build")

    doLast {
        val distDir = file("dist")
        if (!distDir.exists()) {
            throw GradleException("Frontend build did not produce dist/ directory")
        }
        logger.lifecycle("Frontend built successfully: ${distDir.absolutePath}")
    }
}

// Dev server - run with pnpm
tasks.register<Exec>("dev") {
    group = "frontend"
    description = "Start frontend dev server (requires pnpm)"
    workingDir = projectDir

    if (!hasPnpm()) {
        doFirst {
            throw GradleException("pnpm is required but not found. Install it with: npm install -g pnpm")
        }
    }

    commandLine(pnpmCmd, "run", "dev")
}

// Wire base plugin's clean to also remove frontend outputs
tasks.named<Delete>("clean") {
    delete("dist")
    delete("node_modules")
}

// Wire base plugin's build lifecycle to include frontend build
tasks.named("build") {
    dependsOn("buildFrontend")
}

tasks.named("assemble") {
    dependsOn("buildFrontend")
}
