export const AI_STUDIO_ANDROID_PROMPT = `# Google AI Studio Master System Prompt: Build Axiom Path Android Native App

You are an expert Android Native Principal Software Engineer. Your task is to build a complete, production-grade, 100% native Android puzzle game app called "Axiom Path" in Kotlin using Jetpack Compose, Material 3, Android SDK 35, and Room / Jetpack DataStore for local persistence.

Do NOT build a hybrid or WebView app. Every single element — the interactive grid, touch drag engine, winding 3D cartoon adventure journey map, procedural kalimba audio synthesizer, haptic feedback, weekly streak tracker, daily puzzles, and victory confetti — must be built in native Kotlin with Jetpack Compose.

Replicate every single feature, rule, visual style, algorithm, animation, and sound detailed below with extreme fidelity.

---

## 1. GAME CONCEPT & RULES (Hamiltonian Path with Ordered Checkpoints)

"Axiom Path" is a logic puzzle based on a directed Hamiltonian path with numbered checkpoints:
1. **The Objective**: Connect every single playable non-obstacle cell on the grid with one continuous, non-overlapping path.
2. **Sequential Checkpoints**: The board contains numbered checkpoints labeled 1, 2, 3, ... N.
   - The path MUST start at checkpoint 1.
   - The path MUST reach checkpoint 2, then checkpoint 3, and finally checkpoint N strictly in increasing numerical order.
   - You cannot visit checkpoint 2 until checkpoint 1 is connected; you cannot reach checkpoint 3 before 2, etc.
3. **100% Board Coverage (Hamiltonian Path)**: Every single valid cell (total grid cells minus obstacle cells) must be visited exactly once. Reaching the final checkpoint N only counts as a victory if EVERY playable cell has been filled!
4. **Orthogonal Movement**: Path steps can only move orthogonally (Up, Down, Left, Right). No diagonal steps allowed.
5. **No Self-Intersection**: The path cannot cross over itself or visit any cell twice.
6. **Obstacles**: Certain cells on higher levels are blocked obstacles (rocky bluffs, trees, mountain craters) that cannot be stepped on.
7. **Backtracking & Erasure**:
   - Swiping or dragging backward over previously visited cells automatically truncates the path back to that cell.
   - Tapping any earlier cell along the active path immediately truncates the path to that point.
   - Tapping an adjacent unvisited cell extends the path by one step.
   - Double-tapping the head or pressing "Reset" resets the path back to checkpoint 1.

---

## 2. PUZZLE GENERATION ALGORITHM & MATHEMATICAL GUARANTEES

Puzzles must NEVER be unsolvable or random dead-ends. Implement a seeded procedural generator with guaranteed solvability:

### Step 2.1: Seeded PRNG
Implement a fast Mulberry32 or XorShift32 pseudo-random number generator that takes a seed string (e.g., "level_1", "daily_2026-09-30", "practice_medium_123"):
\`\`\`kotlin
class SeededRandom(seed: Long) {
    private var state = seed
    fun nextFloat(): Float {
        state = (state * 1664525L + 1013904223L) and 0xFFFFFFFFL
        return (state ushr 8).toFloat() / 16777216f
    }
    fun nextInt(bound: Int): Int = (nextFloat() * bound).toInt().coerceIn(0, bound - 1)
}
\`\`\`

### Step 2.2: Obstacle Carving
- Determine grid dimensions (R x C):
  - Easy (Levels 1–25): 5 x 5
  - Medium (Levels 26–50): 6 x 6
  - Lagoon / Hard (Levels 51–75): 6 x 6 or 7 x 7
  - Summit / Master (Levels 76–100): 7 x 7
- Obstacle count formula:
  - Level 1–9: 0 obstacles
  - Level 10–20: 1 to 2 obstacles
  - Level 21–40: 2 to 3 obstacles
  - Level 41–60: 3 to 4 obstacles
  - Level 61–80: 4 to 5 obstacles
  - Level 81–100: 5 to 6 obstacles
- Place obstacles such that the remaining playable cells remain a single connected component (verified via Flood Fill / BFS).

### Step 2.3: Self-Avoiding Hamiltonian Walk with Warnsdorff / Backtracking
Generate a valid Hamiltonian path visiting all non-obstacle cells:
1. Pick a random start cell (r0, c0) among non-obstacle cells.
2. Perform a Depth-First Search with Warnsdorff's heuristic (always prioritize adjacent unvisited neighbors that have the fewest remaining unvisited neighbors) to efficiently discover a complete path covering all totalPlayableCells.
3. If search fails within 1,500 iterations, fall back to a pre-computed verified seed.

### Step 2.4: Strategic Checkpoint Distribution
Once the solution path P = [c_1, c_2, ..., c_T] is generated:
1. c_1 is Checkpoint 1.
2. c_T (last cell) is Checkpoint N.
3. Distribute intermediate checkpoints 2, 3, ..., N-1 along the path at regular step intervals (every 5 to 7 steps) or at critical geometric direction changes to guide the player while keeping the logic deduction engaging.
4. Total checkpoints count N:
   - 5x5: 4 to 5 checkpoints
   - 6x6: 5 to 6 checkpoints
   - 7x7: 6 to 8 checkpoints

---

## 3. 100 ADVENTURE LEVELS & THE 4 BIOME REALMS

The adventure campaign features 100 handcrafted progression levels grouped into 4 themed biomes:

### Biome 1: Whispering Meadow (Levels 1–25)
- **Theme**: Lush spring pastures, rolling green hills, blooming wildflowers, and gentle creeks.
- **Palette**: Emerald greens (#10B981, #059669), Mint (#A7F3D0), Soft cream (#FAF9F6).
- **Grid Size**: 5 x 5
- **Obstacles**: None for Lv 1–9; 1–2 obstacles introduced at Lv 10 ("Hurdle Challenge").
- **Milestones**:
  - Lv 5: ⭐ Star Bonus Level
  - Lv 10: ⚡ Hurdle Challenge (Cache Unlocked)
  - Lv 15: 🌀 Twist Maze
  - Lv 20: 👑 Crown Master (Meadow Crest)

### Biome 2: Sunlit Canyon (Levels 26–50)
- **Theme**: Warm terracotta sandstone bluffs, desert arches, blooming cacti, and winding canyons.
- **Palette**: Warm Amber (#F59E0B, #D97706), Desert Gold (#FBBF24), Sunlit Ochre (#FFFBEB).
- **Grid Size**: 6 x 6
- **Obstacles**: 2–3 rocky obstacles.
- **Milestones**: Lv 30, 40, 50 canyon shrines.

### Biome 3: Coral Shallows / Lagoon (Levels 51–75)
- **Theme**: Tropical tidal pools, crystal seafoam currents, coastal lighthouses, and coral bottlenecks.
- **Palette**: Sky Blue (#0EA5E9), Cyan (#06B6D4), Deep Ocean Indigo (#1E1B4B).
- **Grid Size**: 6 x 6 & 7 x 7
- **Obstacles**: 3–4 coral reefs.

### Biome 4: Celestial Summit (Levels 76–100)
- **Theme**: Starlit mountain peaks, aurora borealis, alpine pines, and the Grand Golden Citadel.
- **Palette**: Royal Indigo (#4F46E5), Deep Purple (#7C3AED), Cosmic Pink (#EC4899), Gold (#F59E0B).
- **Grid Size**: 7 x 7
- **Obstacles**: 4–6 alpine obstacles.
- **Final Level 100**: The Golden Castle Citadel (7 x 7, 8 checkpoints, 6 obstacles) — unlocks the "Crown of Axiom" master trophy.

---

## 4. GAME MODES

1. **Adventure Journey Mode (Levels 1–100)**:
   - Linear progression: Level N+1 unlocks upon completing Level N.
   - Replay any previously unlocked level to beat your time or earn 3 stars.
   - Saves level stars (1–3), completion time in seconds, and completion timestamp.
2. **Daily Challenge Mode**:
   - Exactly one unique puzzle generated daily using daily_YYYY-MM-DD as seed.
   - Daily streak tracking: Solved today increment streak; missing a day resets streak.
   - 7-Day Weekly Calendar strip (M, T, W, T, F, S, S) with flame checkmarks.
   - Weekly Cosmetic Badges unlockable upon completing 2, 4, 6, and 7 daily puzzles in a calendar week.
3. **Practice / Free Play Mode**:
   - Instant puzzle generator on demand.
   - Difficulty selector: Easy (5x5), Medium (6x6), Hard (7x7 with obstacles).
   - Endless puzzles for offline logic training.

---

## 5. UI SYSTEM & VISUAL DESIGN SPECIFICATION

Follow a whimsical cartoon adventure aesthetic with clean modern typography and tactile 3D candy pebbles:

### Color Palette
- **Background**: Soft warm paper cream #FAF9F6 and #FBF9F1.
- **Primary Accent**: Vibrant Indigo #4F46E5 / #4338CA.
- **Secondary Accent**: Sunny Amber Gold #F59E0B / #D97706.
- **Card Surfaces**: Pure White #FFFFFF with 24dp rounded corners, 1dp subtle border #E5E7EB, and soft drop shadows 0 4px 12px rgba(0,0,0,0.04).
- **Text**: Deep slate stone #1E293B (primary), muted #64748B (secondary).

### Screen 1: Top Navigation Bar
- App Title: **Axiom Path** with playful paw / compass icon.
- Flame Streak Pill: Displays current streak count with glowing flame icon #F59E0B.
- Active Equipped Badge Avatar: Circle showing player's equipped emoji badge.
- Action Buttons: Stats (Trophy), Rules (Help Circle), Settings (Gear).

### Screen 2: Adventure Cartoon Journey Map (Centerpiece)
- Implement a vertical scrolling canvas / LazyColumn representing the winding trail (total virtual height: 7200px):
  - **S-Curve Trail**: Level nodes positioned on an S-curve: xPercent = 50 + sin((level - 1) * PI / 3.6) * 31.
  - **Connected Trail Ribbon**: Rendered via smooth Bezier curves connecting nodes. Completed segments glow with vibrant #4F46E5 ribbon and soft drop shadow; uncompleted segments are dashed stepping stones #E8DFC8.
  - **3D Tactile Candy Nodes**:
    - Unlocked & Active: Vibrant indigo pebble with pulsing glow, bounce animation, and active player mascot token with speech bubble "Level X".
    - Completed: Golden amber pebble with checkmark and 1–3 golden stars.
    - Locked: Stone gray pebble #E2E8F0 with padlock icon.
  - **Milestone Landmarks & Animated Sprites**:
    - Lv 1: Cozy Campfire & Tent (tappable for easter egg chirp).
    - Lv 2 & 14: Village Cottages with animated chimney smoke puffs.
    - Lv 3 & 19: Hopping Meadow Bunnies (tappable for jump sound).
    - Lv 6: Spinning Windmill sails.
    - Lv 10, 20, 50, 75: Interactive Milestone Treasure Chests.
    - Lv 12: Whispering Brook with gliding ducks.
    - Lv 26: Canyon entrance wooden arch banner.
    - Lv 55: Seaside Lighthouse with revolving light beam.
    - Lv 70: Floating Hot Air Balloon.
    - Lv 100: The Grand Golden Castle Citadel with celebratory sparkles.

### Screen 3: Hero Level & Quick Actions (Docked below map)
- Level Card showing: "Next Adventure · Level X", grid size, difficulty badge.
- Large tactile **"Play / Resume"** button (Indigo, rounded 20dp, tactile press effect).
- Secondary quick pills: "Today's Daily Quest" (with checkmark if completed) and "Practice".
- Weekly 7-Day Streak Dots strip with flame icons and "Badges" reward button.

### Screen 4: Game Play Screen
- **Top HUD**:
  - Back button (left).
  - Level number & difficulty label (center).
  - Timer (00:00) & Move count (right).
- **Progress Counter Pill**: "Progress: 14/25 cells" with animated filling bar.
- **Interactive Grid**:
  - Aspect ratio 1:1, centered, surrounded by card border.
  - Cells: Rounded squares (10dp radius).
  - Empty cell: Soft warm stone #F9FAFB with subtle border.
  - Obstacle cell: Textured rock / tree / mountain icon in darker tone #D1D5DB.
  - Checkpoint cell: Prominent circle with bold number 1, 2, 3... in Indigo.
  - Active path cells: Glowing indigo connection ribbon with flowing directional gradient.
  - Head cell: Vibrant indigo marker with white center dot and subtle pulsing beacon ring.
- **Bottom Controls Bar**:
  - **Undo**: Steps path back by one cell.
  - **Reset**: Resets path back to checkpoint 1.
  - **Hint**: Highlights the next valid step or checkpoint with sparkling golden particles.

### Screen 5: Victory Celebration Modal
- Pops up upon connecting 100% of cells and all checkpoints in order.
- **Confetti Explosion**: Canvas particle burst radiating 60+ colorful circular and rectangular confetti pieces with gravity and flutter physics.
- **Star Rating**: 3 stars animated in with sequential chime sounds:
  - 3 Stars: Solved under target time without hints.
  - 2 Stars: Solved with minor hesitation or 1 hint.
  - 1 Star: Solved.
- Stats: Completion time and moves taken.
- **"Next Level"** primary button & "Replay" secondary button.

---

## 6. TOUCH & GESTURE SYSTEM (Instant Drag & Tap)

Implement a fluid gesture detector using Jetpack Compose's pointerInput:
1. **Touch / Drag Detection**:
   - Convert screen (x, y) touch coordinates into grid cell (row, col) coordinates using grid bounding boxes.
2. **Path Extension**:
   - When finger drags or taps into an unvisited cell that is orthogonally adjacent to the current path head:
     - Check if it violates checkpoint sequence (e.g., trying to step on Checkpoint 3 before Checkpoint 2).
     - If valid: Append cell to path, trigger tactile audio tick, and trigger light haptic feedback.
3. **Path Truncation / Backtracking**:
   - If the finger moves or taps onto a cell already in the path:
     - Truncate the path back to that touched cell instantly.
     - Trigger light pop sound and haptic vibration.
4. **Invalid Move Prevention**:
   - Non-adjacent moves, stepping on obstacles, or stepping out of checkpoint sequence are blocked with an elastic wobble animation and soft buzz sound.

---

## 7. PROCEDURAL AUDIO & MUSIC SYNTHESIZER

Do not rely on large external MP3 assets. Synthesize crisp, playful audio procedurally using Android AudioTrack / SoundPool / PCM synthesis:
1. **Step Notes**: Pentatonic kalimba notes (C4, D4, E4, G4, A4, C5) that gently scale upward in pitch as the path grows longer.
2. **Checkpoint Reached**: Sparkling crystalline triad chord (major chord chime).
3. **Level Complete Fanfare**: Triumphant 5-note brass/chime arpeggio followed by shimmering chord.
4. **Invalid Move Buzz**: Gentle low-frequency wooden thud or soft buzz (120 Hz sine wave).
5. **Ambient Home Screen Music**: Lo-fi pentatonic kalimba & warm pad chord progression (soft sine waves with slow attack and release, 50-60 BPM) that automatically pauses during puzzles.
6. **Mute Toggles**: Independent settings for Sound Effects (SFX) and Background Music (BGM).

---

## 8. HAPTICS ENGINE

Implement native Android Vibrator / VibratorManager with VibrationEffect:
- VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK) on every path cell added.
- VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK) on checkpoint reached.
- VibrationEffect.createWaveform(...) double-pulse pattern on puzzle completion.
- Can be toggled on/off in Settings.

---

## 9. BADGES & GAMIFICATION SYSTEM

Include a rewarding cosmetic badge collection system:
- **Sprout Scout** (🌱): Complete 2 Daily Challenges in a week.
- **Star Wanderer** (⭐): Complete 4 Daily Challenges in a week.
- **Solar Champion** (☀️): Complete 6 Daily Challenges in a week.
- **Crown of Axiom** (👑): Complete all 7 Daily Challenges in a week.
- **Trail Pioneer** (🐾): Clear Level 25 (Meadow).
- **Canyon Conqueror** (🏜️): Clear Level 50 (Canyon).
- **Lagoon Master** (🌊): Clear Level 75 (Lagoon).
- **Summit Sovereign** (🏔️): Clear Level 100 (Summit).
- **Speed Runner** (⚡): Solve any 6x6 puzzle in under 30 seconds.
- **Master Logician** (🧠): Collect 250 Total Stars.
- Players can **Equip** any unlocked badge, which displays as their player token and mascot on the adventure map and header.

---

## 10. LOCAL PERSISTENCE & DATA STORAGE

Use Room Database or Jetpack DataStore for instant offline save & restore:
\`\`\`kotlin
@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: String = "local_user",
    val highestUnlockedLevel: Int = 1,
    val currentLevel: Int = 1,
    val totalStars: Int = 0,
    val currentStreak: Int = 0,
    val maxStreak: Int = 0,
    val activeBadge: String = "badge_sprout",
    val soundEnabled: Boolean = true,
    val musicEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val completedLevelsJson: String = "{}", // Map<Int, LevelRecord>
    val dailyHistoryJson: String = "{}",    // Map<String, DailyRecord>
    val unlockedBadgesJson: String = "[]"
)
\`\`\`

---

## 11. ANDROID PROJECT CONFIGURATION & ARCHITECTURE

### Directory Structure
\`\`\`
app/src/main/
├── AndroidManifest.xml
├── java/com/axiompath/game/
│   ├── MainActivity.kt               # Single-activity Jetpack Compose root
│   ├── data/
│   │   ├── AppDatabase.kt            # Room Database
│   │   ├── UserProfileDao.kt
│   │   └── Repository.kt
│   ├── model/
│   │   ├── GridModels.kt             # GridCoord, Checkpoint, PuzzleData
│   │   ├── LevelInfo.kt              # 100 levels & Biomes metadata
│   │   └── BadgeModels.kt
│   ├── engine/
│   │   ├── PuzzleGenerator.kt        # Hamiltonian walk & obstacle generator
│   │   ├── SoundEngine.kt            # Procedural audio synthesizer
│   │   └── HapticsEngine.kt
│   └── ui/
│       ├── AxiomPathApp.kt           # NavHost & Screen router
│       ├── HomeScreen.kt             # Cartoon Map, Hero Card, Streak Strip
│       ├── GameScreen.kt             # Board, Gesture input, Path Ribbon
│       ├── AdventureMap.kt           # 7200px S-curve canvas & sprites
│       ├── VictoryModal.kt           # Confetti canvas & star animation
│       ├── BadgesModal.kt            # Achievements & Cosmetic equip
│       ├── StatsModal.kt             # Streak, times, & analytics
│       └── SettingsModal.kt          # Audio, haptics, reset, & export
└── res/
    ├── values/
    │   ├── strings.xml
    │   ├── colors.xml
    │   └── themes.xml
    └── mipmap-*/
\`\`\`

### Dependencies (build.gradle.kts)
- compileSdk = 35, minSdk = 24, targetSdk = 35
- androidx.compose.material3:material3:1.3.1
- androidx.activity:activity-compose:1.9.3
- androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6
- androidx.room:room-runtime:2.6.1
- androidx.room:room-ktx:2.6.1
- org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1

---

## 12. EXECUTION INSTRUCTIONS FOR AI STUDIO
1. Generate the complete Kotlin codebase implementing every file in the directory structure above.
2. Ensure the interactive touch drag feels buttery smooth with zero frame drops (using Modifier.pointerInput with detectDragGestures).
3. Ensure all 100 levels are playable with zero network dependency (100% offline).
4. Verify that backtracking, undo, checkpoints, confetti celebration, and sound synthesis compile and run flawlessly in Android Studio.
`;

export function downloadPromptFile(): void {
  const blob = new Blob([AI_STUDIO_ANDROID_PROMPT], { type: 'text/markdown;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'AxiomPath-AI-Studio-Android-Prompt.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
}
