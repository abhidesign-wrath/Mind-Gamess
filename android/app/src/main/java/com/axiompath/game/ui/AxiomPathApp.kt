package com.axiompath.game.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axiompath.game.model.Checkpoint
import com.axiompath.game.model.GridCoord
import com.axiompath.game.model.PuzzleData

@Composable
fun AxiomPathApp() {
    var currentScreen by remember { mutableStateOf("HOME") }
    var currentLevel by remember { mutableStateOf(1) }

    if (currentScreen == "HOME") {
        HomeScreen(
            currentLevel = currentLevel,
            onPlay = { currentScreen = "GAME" }
        )
    } else {
        GameScreen(
            levelNumber = currentLevel,
            onBack = { currentScreen = "HOME" },
            onComplete = {
                currentLevel++
                currentScreen = "HOME"
            }
        )
    }
}

@Composable
fun HomeScreen(
    currentLevel: Int,
    onPlay: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF8F5))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // App Title
        Text(
            text = "Axiom Path",
            fontSize = 32.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF1E254A)
        )
        Text(
            text = "Daily Mind & Logic Puzzle",
            fontSize = 14.sp,
            color = Color(0xFF6B7280),
            modifier = Modifier.padding(top = 4.dp, bottom = 32.dp)
        )

        // Level Card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "NEXT LEVEL",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4F46E5)
                )
                Text(
                    text = "Level $currentLevel",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF1E254A),
                    modifier = Modifier.padding(vertical = 8.dp)
                )

                Button(
                    onClick = onPlay,
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = "Play")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Play Now", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun GameScreen(
    levelNumber: Int,
    onBack: () -> Unit,
    onComplete: () -> Unit
) {
    // 4x4 Grid representation for Jetpack Compose
    val rows = 4
    val cols = 4
    val checkpoints = remember {
        listOf(
            Checkpoint(1, 0, 0),
            Checkpoint(2, 0, 3),
            Checkpoint(3, 3, 3),
            Checkpoint(4, 3, 0)
        )
    }

    var path by remember { mutableStateOf(listOf(GridCoord(0, 0))) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF8F5))
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1E254A))
            }
            Text(
                text = "Level $levelNumber",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1E254A)
            )
            IconButton(onClick = { path = listOf(GridCoord(0, 0)) }) {
                Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = Color(0xFF1E254A))
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Puzzle Grid
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(Color.White, RoundedCornerShape(24.dp))
                .padding(12.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                for (r in 0 until rows) {
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        for (c in 0 until cols) {
                            val coord = GridCoord(r, c)
                            val isPath = path.contains(coord)
                            val cp = checkpoints.find { it.r == r && it.c == c }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .padding(4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        when {
                                            cp != null -> Color(0xFFEEF2FF)
                                            isPath -> Color(0xFFE0E7FF)
                                            else -> Color(0xFFF9FAFB)
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                if (cp != null) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF4F46E5)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = cp.number.toString(),
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
