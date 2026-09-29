import { Checkpoint, GridCoord, PuzzleData, PuzzleDifficulty, GameMode } from '../types/game';
import { createPRNG, hashString } from './prng';

const DIRS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

/**
 * Determine the number of obstacle squares based on the level number.
 * Levels 10+ introduce obstacles to create complex dead-end corridors and bottlenecks.
 */
export function getObstacleCountForLevel(levelNumber: number): number {
  if (levelNumber < 10) return 0;
  if (levelNumber <= 20) return levelNumber % 2 === 0 ? 2 : 1; // 1-2 obstacles on 5x5
  if (levelNumber <= 40) return 2 + (levelNumber % 2); // 2-3 obstacles on 6x6
  if (levelNumber <= 60) return 3 + (levelNumber % 2); // 3-4 obstacles on 6x6
  if (levelNumber <= 80) return 4 + (levelNumber % 2); // 4-5 obstacles on 7x7
  return 5 + (levelNumber % 2); // 5-6 obstacles on 7x7
}

export interface LevelDifficultyInfo {
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  label: 'Easy' | 'Medium' | 'Hard';
  dots: number; // 1 (easy), 2 (medium), 3 (hard)
  color: string;
  dotColor: string;
  gridSize: string;
  hasObstacles: boolean;
}

export interface MilestoneInfo {
  isMilestone: boolean;
  type: 'bonus' | 'hurdle' | 'challenge' | 'crown' | 'master';
  title: string;
  emoji: string;
  tag: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
}

export function getMilestoneInfo(levelNumber: number): MilestoneInfo | null {
  if (levelNumber === 5) {
    return {
      isMilestone: true,
      type: 'bonus',
      title: 'Star Bonus Level',
      emoji: '⭐',
      tag: 'BONUS',
      badgeBg: 'bg-[#FFF9E6]',
      badgeBorder: 'border-[#FADCB0]',
      textColor: 'text-[#D97706]',
    };
  }
  if (levelNumber === 10) {
    return {
      isMilestone: true,
      type: 'hurdle',
      title: 'Hurdle Challenge',
      emoji: '⚡',
      tag: 'HURDLES',
      badgeBg: 'bg-[#FEF5E7]',
      badgeBorder: 'border-[#FBAD33]',
      textColor: 'text-[#D97706]',
    };
  }
  if (levelNumber === 15) {
    return {
      isMilestone: true,
      type: 'challenge',
      title: 'Twist Maze',
      emoji: '🌀',
      tag: 'TWIST',
      badgeBg: 'bg-[#EEF0F9]',
      badgeBorder: 'border-[#D5DCF2]',
      textColor: 'text-[#4C57A9]',
    };
  }
  if (levelNumber === 20) {
    return {
      isMilestone: true,
      type: 'crown',
      title: 'Crown Master',
      emoji: '👑',
      tag: 'CROWN',
      badgeBg: 'bg-[#FFF4E6]',
      badgeBorder: 'border-[#FBAD33]',
      textColor: 'text-[#CC1400]',
    };
  }
  if (levelNumber % 10 === 0) {
    return {
      isMilestone: true,
      type: 'crown',
      title: `Special Level ${levelNumber}`,
      emoji: '🏆',
      tag: 'SPECIAL',
      badgeBg: 'bg-[#FDF2F8]',
      badgeBorder: 'border-[#F472B6]',
      textColor: 'text-[#DB2777]',
    };
  }
  if (levelNumber % 5 === 0) {
    return {
      isMilestone: true,
      type: 'bonus',
      title: `Bonus Level ${levelNumber}`,
      emoji: '✨',
      tag: 'BONUS',
      badgeBg: 'bg-[#EEF6F0]',
      badgeBorder: 'border-[#D2E7D7]',
      textColor: 'text-[#4F8B59]',
    };
  }
  return null;
}

export interface WorldInfo {
  id: number;
  name: string;
  emoji: string;
  startLevel: number;
  endLevel: number;
  themeColor: string;
}

export function getWorldInfo(levelNumber: number): WorldInfo {
  if (levelNumber <= 20) {
    return {
      id: 1,
      name: 'Sunny Meadow',
      emoji: '🌿',
      startLevel: 1,
      endLevel: 20,
      themeColor: '#6BAA75',
    };
  } else if (levelNumber <= 40) {
    return {
      id: 2,
      name: 'Candy Clouds',
      emoji: '🍬',
      startLevel: 21,
      endLevel: 40,
      themeColor: '#C28CAE',
    };
  } else if (levelNumber <= 60) {
    return {
      id: 3,
      name: 'Moon Garden',
      emoji: '🌙',
      startLevel: 41,
      endLevel: 60,
      themeColor: '#967CC7',
    };
  } else if (levelNumber <= 80) {
    return {
      id: 4,
      name: 'Coral Coast',
      emoji: '🌊',
      startLevel: 61,
      endLevel: 80,
      themeColor: '#6698CC',
    };
  } else {
    return {
      id: 5,
      name: 'Cosmic Trail',
      emoji: '✨',
      startLevel: 81,
      endLevel: 100,
      themeColor: '#FBAD33',
    };
  }
}

export function getLevelDifficultyInfo(levelNumber: number): LevelDifficultyInfo {
  if (levelNumber <= 20) {
    return {
      level: levelNumber,
      difficulty: 'easy',
      label: 'Easy',
      dots: 1,
      color: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-400',
      gridSize: levelNumber < 5 ? '4×4' : '5×5',
      hasObstacles: levelNumber >= 10,
    };
  } else if (levelNumber <= 60) {
    return {
      level: levelNumber,
      difficulty: 'medium',
      label: 'Medium',
      dots: 2,
      color: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-400',
      gridSize: '6×6',
      hasObstacles: true,
    };
  } else {
    return {
      level: levelNumber,
      difficulty: 'hard',
      label: 'Hard',
      dots: 3,
      color: 'text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-500',
      gridSize: '7×7',
      hasObstacles: true,
    };
  }
}

interface HamiltonianResult {
  path: GridCoord[];
  obstacles: GridCoord[];
  deadEnds: GridCoord[];
}

/**
 * Robust Hamiltonian path generator supporting:
 * 1. Obstacle placement with checkerboard parity balance
 * 2. Topological dead-end detection (cul-de-sac pockets with degree 1 or forced bottlenecks)
 * 3. BFS flood-fill connectivity pruning to instantly prune impossible branch states
 * 4. Dynamic Warnsdorff score with organic jitter
 */
function findHamiltonianWithObstacles(
  rows: number,
  cols: number,
  numObstacles: number,
  rng: () => number
): HamiltonianResult | null {
  const totalCells = rows * cols;
  const targetLength = totalCells - numObstacles;
  const getIdx = (r: number, c: number) => r * cols + c;
  const isValidCoord = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;

  // Case 1: Open grid without obstacles
  if (numObstacles === 0) {
    const visited = new Uint8Array(totalCells);
    const path: GridCoord[] = [];
    const candidateStarts: GridCoord[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (totalCells % 2 === 1) {
          if ((r + c) % 2 === 0) candidateStarts.push({ r, c });
        } else {
          candidateStarts.push({ r, c });
        }
      }
    }
    shuffle(candidateStarts, rng);

    const isRemainingConnected = (startR: number, startC: number, neededCount: number): boolean => {
      if (neededCount <= 1) return true;
      const queue: number[] = [startR * cols + startC];
      const seen = new Uint8Array(totalCells);
      seen[startR * cols + startC] = 1;
      let count = 0;
      let head = 0;

      while (head < queue.length) {
        const idx = queue[head++];
        count++;
        const cr = Math.floor(idx / cols);
        const cc = idx % cols;

        for (const d of DIRS) {
          const nr = cr + d.dr;
          const nc = cc + d.dc;
          if (isValidCoord(nr, nc)) {
            const nIdx = nr * cols + nc;
            if (visited[nIdx] === 0 && seen[nIdx] === 0) {
              seen[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }
      return count === neededCount;
    };

    for (const start of candidateStarts) {
      path.length = 0;
      visited.fill(0);
      let steps = 0;
      const MAX_STEPS = 6000;

      const dfs = (r: number, c: number): boolean => {
        steps++;
        if (steps > MAX_STEPS) return false;

        visited[getIdx(r, c)] = 1;
        path.push({ r, c });

        if (path.length === totalCells) return true;

        const neighbors: Array<{ r: number; c: number; degree: number; score: number }> = [];
        for (const d of DIRS) {
          const nr = r + d.dr;
          const nc = c + d.dc;
          if (isValidCoord(nr, nc) && visited[getIdx(nr, nc)] === 0) {
            let deg = 0;
            for (const d2 of DIRS) {
              const nnr = nr + d2.dr;
              const nnc = nc + d2.dc;
              if (isValidCoord(nnr, nnc) && visited[getIdx(nnr, nnc)] === 0) deg++;
            }
            neighbors.push({ r: nr, c: nc, degree: deg, score: deg * 3 + rng() * 2.2 });
          }
        }

        if (neighbors.length === 0) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        let zeroDeg = 0;
        for (const n of neighbors) {
          if (n.degree === 0) zeroDeg++;
        }
        if (zeroDeg > 1 && path.length < totalCells - 1) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        const needed = totalCells - path.length;
        if (!isRemainingConnected(neighbors[0].r, neighbors[0].c, needed)) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        neighbors.sort((a, b) => a.score - b.score);
        for (const n of neighbors) {
          if (dfs(n.r, n.c)) return true;
        }

        visited[getIdx(r, c)] = 0;
        path.pop();
        return false;
      };

      if (dfs(start.r, start.c)) {
        return { path, obstacles: [], deadEnds: [] };
      }
    }

    return null;
  }

  // Case 2: Grid with obstacles and dead-ends
  for (let tryObs = 0; tryObs < 35; tryObs++) {
    const obstacleSet = new Set<number>();
    const candidateCells: GridCoord[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        candidateCells.push({ r, c });
      }
    }
    shuffle(candidateCells, rng);

    for (const cand of candidateCells) {
      if (obstacleSet.size >= numObstacles) break;
      obstacleSet.add(getIdx(cand.r, cand.c));
    }

    // Parity validation for bipartite graph with holes
    let even = 0;
    let odd = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = getIdx(r, c);
        if (!obstacleSet.has(idx)) {
          if ((r + c) % 2 === 0) even++;
          else odd++;
        }
      }
    }
    if (Math.abs(even - odd) > 1) continue;

    // Analyze degree of non-obstacle cells and locate cul-de-sac dead-end pockets
    let deg1Count = 0;
    let hasDeg0 = false;
    const deg1Cells: GridCoord[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = getIdx(r, c);
        if (!obstacleSet.has(idx)) {
          let deg = 0;
          for (const d of DIRS) {
            const nr = r + d.dr;
            const nc = c + d.dc;
            if (isValidCoord(nr, nc) && !obstacleSet.has(getIdx(nr, nc))) deg++;
          }
          if (deg === 0) {
            hasDeg0 = true;
            break;
          }
          if (deg === 1) {
            deg1Count++;
            deg1Cells.push({ r, c });
          }
        }
      }
      if (hasDeg0) break;
    }

    // A valid Hamiltonian path can have at most TWO degree-1 cells (the start and end of path)
    if (hasDeg0 || deg1Count > 2) continue;

    const visited = new Uint8Array(totalCells);
    const path: GridCoord[] = [];

    const isRemainingConnected = (startR: number, startC: number, neededCount: number): boolean => {
      if (neededCount <= 1) return true;
      const queue: number[] = [startR * cols + startC];
      const seen = new Uint8Array(totalCells);
      seen[startR * cols + startC] = 1;
      let count = 0;
      let head = 0;

      while (head < queue.length) {
        const idx = queue[head++];
        count++;
        const cr = Math.floor(idx / cols);
        const cc = idx % cols;

        for (const d of DIRS) {
          const nr = cr + d.dr;
          const nc = cc + d.dc;
          if (isValidCoord(nr, nc) && !obstacleSet.has(getIdx(nr, nc))) {
            const nIdx = nr * cols + nc;
            if (visited[nIdx] === 0 && seen[nIdx] === 0) {
              seen[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }
      return count === neededCount;
    };

    // Candidate starts: if degree-1 dead-ends exist, the path MUST start at one of them!
    let candidateStarts: GridCoord[] = [];
    if (deg1Cells.length > 0) {
      candidateStarts = [...deg1Cells];
    } else {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = getIdx(r, c);
          if (!obstacleSet.has(idx)) {
            if (even > odd && (r + c) % 2 === 0) candidateStarts.push({ r, c });
            else if (odd > even && (r + c) % 2 === 1) candidateStarts.push({ r, c });
            else if (even === odd) candidateStarts.push({ r, c });
          }
        }
      }
      shuffle(candidateStarts, rng);
    }

    let foundPath: GridCoord[] | null = null;
    for (const start of candidateStarts) {
      path.length = 0;
      visited.fill(0);
      let steps = 0;
      const MAX_STEPS = 6000;

      const dfs = (r: number, c: number): boolean => {
        steps++;
        if (steps > MAX_STEPS) return false;

        visited[getIdx(r, c)] = 1;
        path.push({ r, c });

        if (path.length === targetLength) return true;

        const neighbors: Array<{ r: number; c: number; degree: number; score: number }> = [];
        for (const d of DIRS) {
          const nr = r + d.dr;
          const nc = c + d.dc;
          if (isValidCoord(nr, nc) && !obstacleSet.has(getIdx(nr, nc)) && visited[getIdx(nr, nc)] === 0) {
            let deg = 0;
            for (const d2 of DIRS) {
              const nnr = nr + d2.dr;
              const nnc = nc + d2.dc;
              if (isValidCoord(nnr, nnc) && !obstacleSet.has(getIdx(nnr, nnc)) && visited[getIdx(nnr, nnc)] === 0) deg++;
            }
            neighbors.push({ r: nr, c: nc, degree: deg, score: deg * 3 + rng() * 2.2 });
          }
        }

        if (neighbors.length === 0) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        let zeroDeg = 0;
        for (const n of neighbors) {
          if (n.degree === 0) zeroDeg++;
        }
        if (zeroDeg > 1 && path.length < targetLength - 1) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        const needed = targetLength - path.length;
        if (!isRemainingConnected(neighbors[0].r, neighbors[0].c, needed)) {
          visited[getIdx(r, c)] = 0;
          path.pop();
          return false;
        }

        neighbors.sort((a, b) => a.score - b.score);
        for (const n of neighbors) {
          if (dfs(n.r, n.c)) return true;
        }

        visited[getIdx(r, c)] = 0;
        path.pop();
        return false;
      };

      if (dfs(start.r, start.c)) {
        foundPath = path;
        break;
      }
    }

    if (foundPath) {
      const obstacles: GridCoord[] = [];
      for (const idx of obstacleSet) {
        obstacles.push({ r: Math.floor(idx / cols), c: idx % cols });
      }
      return { path: foundPath, obstacles, deadEnds: deg1Cells };
    }
  }

  return null;
}

/**
 * Place checkpoints strategically along the Hamiltonian path:
 * - Corners, bottlenecks, and dead-end cul-de-sac pockets are prioritized.
 * - Deceptive geometric placement forces perimeter routing rather than greedy steps.
 */
function selectStrategicCheckpoints(
  path: GridCoord[],
  numCheckpoints: number,
  rows: number,
  cols: number,
  deadEnds: GridCoord[],
  rng: () => number
): Checkpoint[] {
  const totalCells = path.length;
  const checkpoints: Checkpoint[] = [];

  const deadEndSet = new Set(deadEnds.map((d) => `${d.r},${d.c}`));

  // Checkpoint 1 is always the start of the path
  checkpoints.push({
    number: 1,
    r: path[0].r,
    c: path[0].c,
  });

  const remainingSteps = totalCells - 1;
  const numSegments = numCheckpoints - 1;
  const avgStep = remainingSteps / numSegments;
  const minSpacing = Math.max(3, Math.floor(avgStep * 0.55));

  let lastIdx = 0;

  for (let k = 1; k < numCheckpoints - 1; k++) {
    const minIdx = lastIdx + minSpacing;
    const maxIdx = totalCells - 1 - (numCheckpoints - 1 - k) * minSpacing;

    let bestIdx = Math.round(lastIdx + avgStep);
    let bestScore = -1;

    for (let idx = minIdx; idx <= maxIdx; idx++) {
      const pt = path[idx];
      const prev = path[idx - 1];
      const next = path[idx + 1];

      const isCornerCell = (pt.r === 0 || pt.r === rows - 1) && (pt.c === 0 || pt.c === cols - 1);
      const isEdgeCell = pt.r === 0 || pt.r === rows - 1 || pt.c === 0 || pt.c === cols - 1;
      const isTurn = prev.r !== next.r && prev.c !== next.c;
      const isDeadEnd = deadEndSet.has(`${pt.r},${pt.c}`);

      // Distance to previous checkpoint
      const prevCp = checkpoints[checkpoints.length - 1];
      const manhattanDist = Math.abs(pt.r - prevCp.r) + Math.abs(pt.c - prevCp.c);
      const pathDist = idx - lastIdx;

      let score = rng() * 12;
      if (isTurn) score += 18;
      if (isDeadEnd) score += 28;
      if (isCornerCell) score += 24;
      else if (isEdgeCell) score += 10;

      // Deception bonus: visually close in space (2-3 cells), but far along path (>= 4 steps)
      if (manhattanDist >= 2 && manhattanDist <= 3 && pathDist >= 4) {
        score += 26;
      }

      const stepDiff = Math.abs(pathDist - avgStep);
      score -= stepDiff * 1.8;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }

    lastIdx = bestIdx;
    checkpoints.push({
      number: k + 1,
      r: path[bestIdx].r,
      c: path[bestIdx].c,
    });
  }

  // Final checkpoint is always the exact end of the path
  checkpoints.push({
    number: numCheckpoints,
    r: path[totalCells - 1].r,
    c: path[totalCells - 1].c,
  });

  return checkpoints;
}

/**
 * Generate a complete puzzle for practice or daily mode
 */
export function generatePuzzle(
  mode: GameMode,
  difficulty: PuzzleDifficulty,
  seedOrDate?: number | string
): PuzzleData {
  let seed: number;
  let dateStr: string | undefined;

  if (typeof seedOrDate === 'string') {
    dateStr = seedOrDate;
    seed = hashString(`axiom-daily-${seedOrDate}`);
  } else if (typeof seedOrDate === 'number') {
    seed = seedOrDate;
  } else {
    seed = Math.floor(Math.random() * 10000000);
  }

  let rows = 5;
  let cols = 5;
  let numCheckpoints = 5;
  let numObstacles = 0;

  if (difficulty === 'easy') {
    rows = 5;
    cols = 5;
    numCheckpoints = 5;
    numObstacles = 1; // Introduce 1 obstacle in practice mode for flavor
  } else if (difficulty === 'medium') {
    rows = 6;
    cols = 6;
    numCheckpoints = 6;
    numObstacles = 2;
  } else {
    rows = 7;
    cols = 7;
    numCheckpoints = 7;
    numObstacles = 3;
  }

  let result: HamiltonianResult | null = null;
  let attempt = 0;

  while (!result && attempt < 12) {
    const rng = createPRNG((seed + attempt * 7919) >>> 0);
    result = findHamiltonianWithObstacles(rows, cols, numObstacles, rng);
    attempt++;
  }

  // Fallback guaranteed path if needed
  if (!result || result.path.length === 0) {
    const fallbackPath: GridCoord[] = [];
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < cols; c++) fallbackPath.push({ r, c });
      } else {
        for (let c = cols - 1; c >= 0; c--) fallbackPath.push({ r, c });
      }
    }
    result = { path: fallbackPath, obstacles: [], deadEnds: [] };
  }

  const { path, obstacles, deadEnds } = result;
  const rngCp = createPRNG(seed);
  const checkpoints = selectStrategicCheckpoints(path, numCheckpoints, rows, cols, deadEnds, rngCp);
  const totalCells = path.length;

  const puzzleId =
    mode === 'daily'
      ? `daily-${dateStr || new Date().toISOString().split('T')[0]}`
      : `practice-${difficulty}-${seed}`;

  return {
    id: puzzleId,
    mode,
    difficulty,
    date: dateStr,
    rows,
    cols,
    totalCells,
    checkpoints,
    solution: path,
    seed,
    obstacles,
    deadEnds,
  };
}

export const TOTAL_LEVELS = 100;

export function getLevelTier(levelNumber: number): 'beginner' | 'intermediate' | 'advanced' {
  if (levelNumber <= 20) return 'beginner';
  if (levelNumber <= 60) return 'intermediate';
  return 'advanced';
}

// In-memory cache for deterministic level generation across the session
const levelCache = new Map<number, PuzzleData>();

/**
 * Generate a deterministic level puzzle for campaign progression (Levels 1 to 100+)
 * - Levels 1–9: 5x5 open grids (25 cells) with 5 checkpoints.
 * - Levels 10–20: 5x5 grids with 1-2 'Obstacle' squares and 'Dead-end' corridors.
 * - Levels 21–60: 6x6 grids with 2-4 'Obstacle' squares and labyrinth dead-end pockets.
 * - Levels 61–100: 7x7 grids with 4-6 'Obstacle' squares and high-density dead-end paths.
 */
export function generateLevelPuzzle(levelNumber: number): PuzzleData {
  if (levelCache.has(levelNumber)) {
    return levelCache.get(levelNumber)!;
  }

  const tier = getLevelTier(levelNumber);

  let rows = 5;
  let cols = 5;
  let numCheckpoints = 5;
  let difficulty: PuzzleDifficulty = 'easy';

  if (levelNumber <= 10) {
    rows = 5;
    cols = 5;
    numCheckpoints = 5;
    difficulty = 'easy';
  } else if (levelNumber <= 20) {
    rows = 5;
    cols = 5;
    numCheckpoints = 6;
    difficulty = 'easy';
  } else if (levelNumber <= 40) {
    rows = 6;
    cols = 6;
    numCheckpoints = 6;
    difficulty = 'medium';
  } else if (levelNumber <= 60) {
    rows = 6;
    cols = 6;
    numCheckpoints = 7;
    difficulty = 'medium';
  } else if (levelNumber <= 80) {
    rows = 7;
    cols = 7;
    numCheckpoints = 7;
    difficulty = 'hard';
  } else {
    rows = 7;
    cols = 7;
    numCheckpoints = 8;
    difficulty = 'hard';
  }

  const numObstacles = getObstacleCountForLevel(levelNumber);

  let result: HamiltonianResult | null = null;
  let chosenSeed = hashString(`axiom-level-v9-${levelNumber}`);
  let attempt = 0;

  while (!result && attempt < 16) {
    chosenSeed = hashString(`axiom-level-v9-${levelNumber}-att-${attempt}`);
    const rng = createPRNG(chosenSeed);
    result = findHamiltonianWithObstacles(rows, cols, numObstacles, rng);
    attempt++;
  }

  if (!result || result.path.length === 0) {
    // Fallback in case of exhausted attempts
    const fallbackPath: GridCoord[] = [];
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < cols; c++) fallbackPath.push({ r, c });
      } else {
        for (let c = cols - 1; c >= 0; c--) fallbackPath.push({ r, c });
      }
    }
    result = { path: fallbackPath, obstacles: [], deadEnds: [] };
  }

  const { path, obstacles, deadEnds } = result;
  const totalCells = path.length;
  const rngCp = createPRNG(chosenSeed);
  const checkpoints = selectStrategicCheckpoints(path, numCheckpoints, rows, cols, deadEnds, rngCp);

  const puzzle: PuzzleData = {
    id: `level-${levelNumber}`,
    mode: 'level',
    levelNumber,
    tier,
    difficulty,
    rows,
    cols,
    totalCells,
    checkpoints,
    solution: path,
    seed: chosenSeed,
    obstacles,
    deadEnds,
  };

  levelCache.set(levelNumber, puzzle);
  return puzzle;
}

/**
 * Get difficulty for a given day of the week for daily puzzles
 */
export function getDailyDifficulty(dateString: string): PuzzleDifficulty {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1 || dayOfWeek === 2) return 'easy';
  if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) return 'medium';
  return 'hard';
}
