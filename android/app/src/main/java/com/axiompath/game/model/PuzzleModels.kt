package com.axiompath.game.model

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
