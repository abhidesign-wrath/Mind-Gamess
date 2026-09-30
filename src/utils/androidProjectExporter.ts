import JSZip from 'jszip';

export interface AndroidSourceFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_FILES: AndroidSourceFile[] = [
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Project name & Gradle plugin repositories configuration',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AxiomPath"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts (Root)',
    language: 'kotlin',
    description: 'Root Gradle build setup',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    filename: 'libs.versions.toml',
    language: 'toml',
    description: 'Gradle Version Catalog for Android SDK 35 & Jetpack Compose',
    content: `[versions]
agp = "8.6.1"
kotlin = "2.0.21"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.6"
activityCompose = "1.9.3"
composeBom = "2024.10.00"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    filename: 'gradle-wrapper.properties',
    language: 'properties',
    description: 'Gradle wrapper distribution config (v8.9)',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'App module build script with Jetpack Compose & SDK 35',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.axiompath.game"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.axiompath.game"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
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
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    debugImplementation(libs.androidx.ui.tooling)
}
`,
  },
  {
    path: 'app/proguard-rules.pro',
    filename: 'proguard-rules.pro',
    language: 'pro',
    description: 'ProGuard release rules for Jetpack Compose',
    content: `# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android App Manifest with launcher activity & permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AxiomPath">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AxiomPath">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    language: 'xml',
    description: 'App name strings',
    content: `<resources>
    <string name="app_name">Axiom Path</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    filename: 'colors.xml',
    language: 'xml',
    description: 'Color theme palette',
    content: `<resources>
    <color name="primary">#4F46E5</color>
    <color name="primary_dark">#3730A3</color>
    <color name="accent">#F59E0B</color>
    <color name="background">#FAF8F5</color>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    filename: 'themes.xml',
    language: 'xml',
    description: 'Material Light theme definition',
    content: `<resources>
    <style name="Theme.AxiomPath" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#4F46E5</item>
        <item name="android:navigationBarColor">#FAF8F5</item>
    </style>
</resources>
`,
  },
  {
    path: 'app/src/main/java/com/axiompath/game/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Main activity entry point',
    content: `package com.axiompath.game

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.axiompath.game.ui.AxiomPathApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AxiomPathApp()
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/axiompath/game/model/PuzzleModels.kt',
    filename: 'PuzzleModels.kt',
    language: 'kotlin',
    description: 'Puzzle data classes, checkpoints, coordinates, and board models',
    content: `package com.axiompath.game.model

data class GridCoord(
    val r: Int,
    val c: Int
)

data class Checkpoint(
    val number: Int,
    val r: Int,
    val c: Int
)

enum class PuzzleDifficulty {
    EASY,
    MEDIUM,
    HARD
}

data class PuzzleData(
    val id: String,
    val levelNumber: Int,
    val rows: Int,
    val cols: Int,
    val checkpoints: List<Checkpoint>,
    val solution: List<GridCoord>,
    val obstacles: Set<GridCoord> = emptySet()
) {
    val totalPlayableCells: Int get() = (rows * cols) - obstacles.size
}
`,
  },
  {
    path: 'app/src/main/java/com/axiompath/game/ui/AxiomPathApp.kt',
    filename: 'AxiomPathApp.kt',
    language: 'kotlin',
    description: 'Jetpack Compose game UI, interactive grid touch drag, and adventure map',
    content: `package com.axiompath.game.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axiompath.game.model.Checkpoint
import com.axiompath.game.model.GridCoord

@Composable
fun AxiomPathApp() {
    var currentScreen by remember { mutableStateOf("HOME") }
    var currentLevel by remember { mutableStateOf(1) }
    val completedLevels = remember { mutableStateMapOf<Int, Int>() }

    if (currentScreen == "HOME") {
        HomeScreen(
            currentLevel = currentLevel,
            completedLevels = completedLevels,
            onPlay = { level ->
                currentLevel = level
                currentScreen = "GAME"
            }
        )
    } else {
        GameScreen(
            levelNumber = currentLevel,
            onBack = { currentScreen = "HOME" },
            onLevelWon = { stars ->
                completedLevels[currentLevel] = stars
                if (currentLevel < 100) {
                    currentLevel++
                }
                currentScreen = "HOME"
            }
        )
    }
}

@Composable
fun HomeScreen(
    currentLevel: Int,
    completedLevels: Map<Int, Int>,
    onPlay: (Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF9F6))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Title
        Text(
            text = "Axiom Path",
            fontSize = 30.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF1E254A)
        )
        Text(
            text = "Daily Mind & Logic Path Puzzle",
            fontSize = 13.sp,
            color = Color(0xFF6B7280),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Hero Next Level Card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "NEXT ADVENTURE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4F46E5)
                )
                Text(
                    text = "Level $currentLevel",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF1E254A),
                    modifier = Modifier.padding(vertical = 6.dp)
                )

                Button(
                    onClick = { onPlay(currentLevel) },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    Text(text = "Play Level $currentLevel", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Levels List
        Text(
            text = "Adventure Map (100 Levels)",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1E254A),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        )

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(100) { index ->
                val level = index + 1
                val isUnlocked = level <= currentLevel
                val isCompleted = completedLevels.containsKey(level)

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isUnlocked) Color.White else Color(0xFFF3F4F6)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(enabled = isUnlocked) { onPlay(level) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Level $level",
                                fontWeight = FontWeight.Bold,
                                color = if (isUnlocked) Color(0xFF1E254A) else Color(0xFF9CA3AF)
                            )
                            Text(
                                text = when {
                                    level <= 25 -> "Meadow · 5×5 Grid"
                                    level <= 50 -> "Canyon · 6×6 Grid"
                                    level <= 75 -> "Lagoon · 6×6 Grid"
                                    else -> "Summit · 7×7 Grid"
                                },
                                fontSize = 12.sp,
                                color = Color(0xFF6B7280)
                            )
                        }

                        if (isCompleted) {
                            Text(text = "⭐ Cleared", fontSize = 12.sp, color = Color(0xFFD97706), fontWeight = FontWeight.Bold)
                        } else if (isUnlocked) {
                            Text(text = "▶ Play", fontSize = 12.sp, color = Color(0xFF4F46E5), fontWeight = FontWeight.Bold)
                        } else {
                            Text(text = "🔒", fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GameScreen(
    levelNumber: Int,
    onBack: () -> Unit,
    onLevelWon: (Int) -> Unit
) {
    val size = if (levelNumber <= 25) 5 else if (levelNumber <= 75) 6 else 7
    val checkpoints = remember(levelNumber) {
        listOf(
            Checkpoint(1, 0, 0),
            Checkpoint(2, 0, size - 1),
            Checkpoint(3, size - 1, size - 1),
            Checkpoint(4, size - 1, 0)
        )
    }

    var path by remember(levelNumber) { mutableStateOf(listOf(GridCoord(0, 0))) }
    val totalPlayable = size * size
    val isComplete = path.size == totalPlayable

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF9F6))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = onBack,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE5E7EB))
            ) {
                Text("← Back", color = Color(0xFF1E254A), fontWeight = FontWeight.Bold)
            }
            Text(
                text = "Level $levelNumber",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF1E254A)
            )
            Button(
                onClick = { path = listOf(GridCoord(0, 0)) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE5E7EB))
            ) {
                Text("Reset", color = Color(0xFF1E254A), fontWeight = FontWeight.Bold)
            }
        }

        // Progress Pill
        Row(
            modifier = Modifier
                .padding(vertical = 12.dp)
                .background(Color(0xFFEEF2FF), RoundedCornerShape(12.dp))
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Progress: \${path.size}/$totalPlayable cells",
                color = Color(0xFF4F46E5),
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
            )
        }

        // Game Grid
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(Color.White, RoundedCornerShape(24.dp))
                .border(2.dp, Color(0xFFE5E7EB), RoundedCornerShape(24.dp))
                .padding(8.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                for (r in 0 until size) {
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        for (c in 0 until size) {
                            val coord = GridCoord(r, c)
                            val pathIndex = path.indexOf(coord)
                            val isPath = pathIndex != -1
                            val isHead = path.lastOrNull() == coord
                            val cp = checkpoints.find { it.r == r && it.c == c }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .padding(3.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(
                                        when {
                                            isHead -> Color(0xFF4F46E5)
                                            isPath -> Color(0xFFC7D2FE)
                                            cp != null -> Color(0xFFEEF2FF)
                                            else -> Color(0xFFF9FAFB)
                                        }
                                    )
                                    .clickable {
                                        // Tap step logic
                                        if (isPath && coord != path.lastOrNull()) {
                                            // Backtrack
                                            path = path.subList(0, pathIndex + 1)
                                        } else if (!isPath) {
                                            val last = path.last()
                                            val isAdjacent = (Math.abs(last.r - r) + Math.abs(last.c - c)) == 1
                                            if (isAdjacent) {
                                                path = path + coord
                                            }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                if (cp != null) {
                                    Text(
                                        text = "\${cp.number}",
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 14.sp,
                                        color = if (isHead) Color.White else if (isPath) Color(0xFF1E254A) else Color(0xFF4F46E5)
                                    )
                                } else if (isHead) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(Color.White)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Win Banner
        AnimatedVisibility(visible = isComplete) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🎉 Level Complete!",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = Color(0xFF065F46)
                    )
                    Text(
                        text = "You connected every cell in pure harmony!",
                        fontSize = 12.sp,
                        color = Color(0xFF047857),
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Button(
                        onClick = { onLevelWon(3) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Text("Continue Journey", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    description: 'Instructions to open, build, and run in Android Studio',
    content: `# Axiom Path - Native Android App

A pure native Android implementation of **Axiom Path** built with **Kotlin** & **Jetpack Compose**.

## 🚀 How to Open in Android Studio

1. Extract this zip folder to your computer.
2. Open **Android Studio** (Ladybug, Iguana, Hedgehog, or newer).
3. Select **File > Open** and choose the extracted \`AxiomPath\` folder.
4. Android Studio will automatically recognize the Gradle build files and sync the dependencies.
5. Click **Run 'app'** (or press \`Shift + F10\`) to launch the game on an emulator or physical device.

## 📦 Building an APK / AAB
- **Debug APK**: Run \`./gradlew assembleDebug\` (found in \`app/build/outputs/apk/debug/app-debug.apk\`).
- **Release APK**: Run \`./gradlew assembleRelease\`.

Enjoy crafting logic paths! 🐾
`,
  },
];

/**
 * Live in-browser Zip file generator and downloader
 */
export async function generateAndDownloadAndroidZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('AxiomPath') || zip;

  for (const file of ANDROID_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Generate binary ZIP blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Trigger browser download via Object URL
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'AxiomPath-Android-Native.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up Object URL
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 2000);
}
