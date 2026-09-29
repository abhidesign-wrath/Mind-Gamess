import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Check, Sparkles, Flag, Footprints, Target } from 'lucide-react';
import { Checkpoint, GridCoord, PuzzleData } from '../types/game';
import { sound } from '../utils/sound';
import { vibrate } from '../utils/haptics';
import { getCheckpointColor, getCheckpointNumberStyle, CheckpointColorDef } from '../utils/checkpointColors';

interface PuzzleBoardProps {
  puzzle: PuzzleData;
  path: GridCoord[];
  onPathChange: (newPath: GridCoord[], action: 'step' | 'backtrack' | 'reset') => void;
  isCompleted: boolean;
  showStepNumbers?: boolean;
  showAdjacentHints?: boolean;
  hintCell?: GridCoord | null;
  enablePathSegmentBorder?: boolean;
  getPathSegmentBorderColor?: (checkpointNumber: number) => string;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  puzzle,
  path,
  onPathChange,
  isCompleted,
  showStepNumbers = true,
  showAdjacentHints = true,
  hintCell = null,
  enablePathSegmentBorder = true,
  getPathSegmentBorderColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [boardDimensions, setBoardDimensions] = useState<{ width: number; height: number }>({
    width: 340,
    height: 340,
  });
  const [invalidFlash, setInvalidFlash] = useState<GridCoord | null>(null);

  // Synchronous reference to current path to prevent any stale state during fast pointer dragging
  const pathRef = useRef<GridCoord[]>(path);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  // Checkpoint-only pulse/ripple animation when a checkpoint is successfully reached
  const [activeCheckpointPulse, setActiveCheckpointPulse] = useState<{
    r: number;
    c: number;
    number: number;
    id: number;
  } | null>(null);
  const checkpointPulseTimeoutRef = useRef<number | null>(null);

  const { rows, cols, checkpoints, totalCells } = puzzle;

  // Track size of inner grid for perfect SVG line calculation & responsive touch tracking
  useEffect(() => {
    const updateSize = () => {
      const target = gridRef.current || containerRef.current;
      if (target) {
        const rect = target.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setBoardDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      if (gridRef.current) resizeObserver.observe(gridRef.current);
      if (containerRef.current) resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver?.disconnect();
    };
  }, []);

  // Quick lookup helper: map key "r,c" to checkpoint if any
  const checkpointMap = React.useMemo(() => {
    const map = new Map<string, Checkpoint>();
    checkpoints.forEach((cp) => {
      map.set(`${cp.r},${cp.c}`, cp);
    });
    return map;
  }, [checkpoints]);

  // Lookup helper for impassable obstacle squares
  const obstacleMap = React.useMemo(() => {
    const map = new Set<string>();
    (puzzle.obstacles || []).forEach((o) => {
      map.add(`${o.r},${o.c}`);
    });
    return map;
  }, [puzzle.obstacles]);

  // Lookup helper for topological dead-end cul-de-sacs
  const deadEndMap = React.useMemo(() => {
    const map = new Set<string>();
    (puzzle.deadEnds || []).forEach((d) => {
      map.add(`${d.r},${d.c}`);
    });
    return map;
  }, [puzzle.deadEnds]);

  // Lookup helper: map key "r,c" to path index
  const pathIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    path.forEach((pt, idx) => {
      map.set(`${pt.r},${pt.c}`, idx);
    });
    return map;
  }, [path]);

  // Determine which checkpoints have already been reached
  const visitedCheckpoints = React.useMemo(() => {
    const reached = new Set<number>();
    path.forEach((pt) => {
      const cp = checkpointMap.get(`${pt.r},${pt.c}`);
      if (cp) reached.add(cp.number);
    });
    return reached;
  }, [path, checkpointMap]);

  // The next expected checkpoint number
  const nextExpectedCheckpointNumber = React.useMemo(() => {
    for (let k = 1; k <= checkpoints.length; k++) {
      if (!visitedCheckpoints.has(k)) {
        return k;
      }
    }
    return checkpoints.length + 1; // all reached
  }, [visitedCheckpoints, checkpoints.length]);

  const triggerHaptic = (type: 'step' | 'checkpoint' | 'backtrack') => {
    if (type === 'step') {
      vibrate(10); // subtle 10ms pulse when drawing a segment
    } else if (type === 'checkpoint') {
      vibrate(30); // 30ms pulse on reaching a checkpoint
    } else if (type === 'backtrack') {
      vibrate(8);
    }
  };

  const flashInvalid = (r: number, c: number) => {
    sound.playInvalid();
    setInvalidFlash({ r, c });
    setTimeout(() => setInvalidFlash(null), 350);
  };

  const triggerCheckpointRipple = useCallback((r: number, c: number, cpNum: number) => {
    const id = Date.now();
    setActiveCheckpointPulse({ r, c, number: cpNum, id });

    if (checkpointPulseTimeoutRef.current) {
      window.clearTimeout(checkpointPulseTimeoutRef.current);
    }
    checkpointPulseTimeoutRef.current = window.setTimeout(() => {
      setActiveCheckpointPulse(null);
    }, 350);
  }, []);

  /**
   * Controlled single-cell transition enforcing:
   * 1. Path must stay connected: previous cell → current cell → next adjacent cell
   * 2. Cannot jump, cannot attach to older parts, cannot skip intermediate cells, cannot teleport diagonally
   * 3. Backtracking only allows stepping backward to the immediate previous cell along the exact route
   * 4. Normal cells extend path with no ripple/wave; checkpoints trigger elegant pulse/ripple
   */
  const handleCellTransition = useCallback(
    (target: GridCoord) => {
      if (isCompleted) return;
      const currentPath = pathRef.current;
      const { r, c } = target;

      // Board boundary check & obstacle check
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (obstacleMap.has(`${r},${c}`)) {
        flashInvalid(r, c);
        return;
      }

      // CASE 1: Empty path - can ONLY start at Checkpoint 1
      if (currentPath.length === 0) {
        const cp = checkpointMap.get(`${r},${c}`);
        if (cp && cp.number === 1) {
          sound.playChime(1);
          triggerHaptic('checkpoint');
          triggerCheckpointRipple(r, c, 1);
          const newPath = [{ r, c }];
          pathRef.current = newPath;
          onPathChange(newPath, 'step');
        } else {
          flashInvalid(r, c);
        }
        return;
      }

      const head = currentPath[currentPath.length - 1];

      // If already at head, no movement
      if (head.r === r && head.c === c) {
        return;
      }

      // Check orthogonal adjacency: previous cell -> current cell -> next adjacent cell
      const dr = Math.abs(head.r - r);
      const dc = Math.abs(head.c - c);
      const isDirectlyAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);

      if (!isDirectlyAdjacent) {
        // Must NOT teleport across diagonal cells, skip intermediate cells, or jump to distant squares
        return;
      }

      // CASE 2: Controlled backtracking along the exact path came from
      // Only allowed if target is the immediately previous cell in the path (path[path.length - 2])
      if (currentPath.length > 1) {
        const prevCell = currentPath[currentPath.length - 2];
        if (prevCell.r === r && prevCell.c === c) {
          const newPath = currentPath.slice(0, currentPath.length - 1);
          pathRef.current = newPath;
          sound.playBacktrack();
          triggerHaptic('backtrack');
          onPathChange(newPath, 'backtrack');
          return;
        }
      }

      // CASE 3: Cell is already in the path (and is NOT the immediate backtrack cell)
      // Must NOT attach to an older part of the path or jump from D to B or an unrelated square
      const isAlreadyVisited = currentPath.some((pt) => pt.r === r && pt.c === c);
      if (isAlreadyVisited) {
        return;
      }

      // CASE 4: Forward extension to an unvisited directly adjacent cell
      const cpAtCell = checkpointMap.get(`${r},${c}`);
      if (cpAtCell) {
        const cpNum = cpAtCell.number;

        // Checkpoint must be in exact sequential order
        if (cpNum !== nextExpectedCheckpointNumber) {
          flashInvalid(r, c);
          return;
        }

        // Final checkpoint must be the last remaining cell to fill the entire grid
        if (cpNum === checkpoints.length && currentPath.length + 1 < totalCells) {
          flashInvalid(r, c);
          return;
        }

        // Reaching next checkpoint:
        // Subtle pulse/ripple, activate the number, switch path to that number's color
        const newPath = [...currentPath, { r, c }];
        pathRef.current = newPath;
        sound.playChime(cpNum);
        triggerHaptic('checkpoint');
        triggerCheckpointRipple(r, c, cpNum);
        onPathChange(newPath, 'step');
        return;
      }

      // Regular normal cell:
      // "no ripple, no wave, just extend the path"
      const newPath = [...currentPath, { r, c }];
      pathRef.current = newPath;
      const progress = newPath.length / totalCells;
      sound.playPlop(progress);
      triggerHaptic('step');
      onPathChange(newPath, 'step');
    },
    [
      isCompleted,
      rows,
      cols,
      checkpointMap,
      checkpoints.length,
      nextExpectedCheckpointNumber,
      totalCells,
      onPathChange,
      triggerCheckpointRipple,
    ]
  );

  // Convert client coordinates to grid cell
  const getCellFromCoords = (clientX: number, clientY: number): GridCoord | null => {
    const target = gridRef.current || containerRef.current;
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) {
      return null;
    }

    const c = Math.floor(x / cellWidth);
    const r = Math.floor(y / cellHeight);

    if (r < 0 || r >= rows || c < 0 || c >= cols) {
      return null;
    }

    return { r, c };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompleted || !containerRef.current) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // safe ignore
    }
    isDraggingRef.current = true;
    const cell = getCellFromCoords(e.clientX, e.clientY);
    if (cell) {
      handleCellTransition(cell);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isCompleted || !containerRef.current) return;

    // Use coalesced touch events for continuous hardware tracking if supported
    const nativeEv = e.nativeEvent as unknown as { getCoalescedEvents?: () => PointerEvent[] };
    const events = typeof nativeEv?.getCoalescedEvents === 'function' ? nativeEv.getCoalescedEvents() : [e];
    for (const ev of events) {
      const cell = getCellFromCoords(ev.clientX, ev.clientY);
      if (cell) {
        handleCellTransition(cell);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // safe ignore
    }
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
  };

  // Keyboard navigation for power users and desktop access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || pathRef.current.length === 0) return;
      const head = pathRef.current[pathRef.current.length - 1];
      let targetR = head.r;
      let targetC = head.c;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') targetR -= 1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') targetR += 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') targetC -= 1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') targetC += 1;
      else if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') {
        if (pathRef.current.length > 1) {
          const prev = pathRef.current[pathRef.current.length - 2];
          handleCellTransition(prev);
        }
        return;
      } else {
        return;
      }

      e.preventDefault();
      handleCellTransition({ r: targetR, c: targetC });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, handleCellTransition]);

  // Active checkpoint number for the drawing head
  const activeHeadCpNum = React.useMemo(() => {
    if (path.length === 0) return 1;
    for (let i = path.length - 1; i >= 0; i--) {
      const cp = checkpointMap.get(`${path[i].r},${path[i].c}`);
      if (cp) return cp.number;
    }
    return 1;
  }, [path, checkpointMap]);

  const activeHeadColorDef = React.useMemo(() => {
    return getCheckpointColor(activeHeadCpNum);
  }, [activeHeadCpNum]);

  // Compute SVG coordinates for the continuous drawn line
  const cellW = boardDimensions.width / cols;
  const cellH = boardDimensions.height / rows;

  const svgPathData = React.useMemo(() => {
    if (path.length === 0) return '';
    return path.reduce((acc, pt, i) => {
      const x = pt.c * cellW + cellW / 2;
      const y = pt.r * cellH + cellH / 2;
      if (i === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, '');
  }, [path, cellW, cellH]);

  // Multi-colored path sections:
  // The path uses the color of the checkpoint it most recently connected to.
  // Existing line segments keep their previous color; each transition happens precisely at a checkpoint.
  // 1 ──BLUE── 2 ──GREEN── 3 ──ORANGE── 4 ──PURPLE── 5
  const pathSections = React.useMemo(() => {
    if (path.length <= 1) return [];

    const sections: Array<{
      checkpointNumber: number;
      d: string;
      colorDef: CheckpointColorDef;
      borderColor: string;
    }> = [];

    let currentCpNum = 1;
    const startCp = checkpointMap.get(`${path[0].r},${path[0].c}`);
    if (startCp) currentCpNum = startCp.number;

    let currentPoints: GridCoord[] = [path[0]];

    for (let i = 0; i < path.length - 1; i++) {
      const ptFrom = path[i];
      const ptTo = path[i + 1];

      // If ptFrom is a checkpoint (and not index 0), a new color starts for the outgoing stroke
      if (i > 0) {
        const cpAtFrom = checkpointMap.get(`${ptFrom.r},${ptFrom.c}`);
        if (cpAtFrom && cpAtFrom.number !== currentCpNum) {
          if (currentPoints.length > 1) {
            const d = currentPoints.reduce((acc, pt, idx) => {
              const x = pt.c * cellW + cellW / 2;
              const y = pt.r * cellH + cellH / 2;
              return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, '');
            const colorDef = getCheckpointColor(currentCpNum);
            const borderColor = getPathSegmentBorderColor
              ? getPathSegmentBorderColor(currentCpNum)
              : (colorDef.stringBorderColor || colorDef.hexDark);

            sections.push({
              checkpointNumber: currentCpNum,
              d,
              colorDef,
              borderColor,
            });
          }
          currentCpNum = cpAtFrom.number;
          currentPoints = [ptFrom];
        }
      }

      currentPoints.push(ptTo);
    }

    if (currentPoints.length > 1) {
      const d = currentPoints.reduce((acc, pt, idx) => {
        const x = pt.c * cellW + cellW / 2;
        const y = pt.r * cellH + cellH / 2;
        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
      }, '');
      const colorDef = getCheckpointColor(currentCpNum);
      const borderColor = getPathSegmentBorderColor
        ? getPathSegmentBorderColor(currentCpNum)
        : (colorDef.stringBorderColor || colorDef.hexDark);

      sections.push({
        checkpointNumber: currentCpNum,
        d,
        colorDef,
        borderColor,
      });
    }

    return sections;
  }, [path, checkpointMap, cellW, cellH, getPathSegmentBorderColor]);

  const currentHead = path.length > 0 ? path[path.length - 1] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto select-none">
      {/* Board wrapper: clean, minimal, warm neutral, joyful game styling */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative w-full aspect-square puzzle-board-container bg-white rounded-3xl shadow-sm border border-stone-200/90 p-2 sm:p-2.5 overflow-hidden cursor-crosshair transition-colors"
        style={{ touchAction: 'none' }}
      >
        {/* Background Grid Cells & Layer Wrapper */}
        <div ref={gridRef} className="relative w-full h-full">
          <div
            className="grid w-full h-full gap-1 sm:gap-1.5"
            style={{
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const cellKey = `${r},${c}`;
                const isObstacle = obstacleMap.has(cellKey);
                const isDeadEnd = deadEndMap.has(cellKey);

                // Render playful obstacle block with fun hurdle graphic
                if (isObstacle) {
                  const hurdleImage =
                    (r + c) % 2 === 0
                      ? '/src/assets/images/hurdle_toy_block_1790232072766.jpg'
                      : '/src/assets/images/hurdle_cone_barrier_1790232105131.jpg';

                  return (
                    <div
                      key={cellKey}
                      data-row={r}
                      data-col={c}
                      className="relative flex items-center justify-center rounded-xl sm:rounded-2xl bg-stone-100 border border-stone-200 shadow-inner overflow-hidden select-none cursor-not-allowed pointer-events-none p-1 sm:p-1.5 transition-transform"
                      title="Hurdle Obstacle - walk around"
                    >
                      <img
                        src={hurdleImage}
                        alt="Hurdle"
                        className="w-full h-full object-contain rounded-lg drop-shadow-xs pointer-events-none opacity-90"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                }

                const cp = checkpointMap.get(cellKey);
                const pathIdx = pathIndexMap.get(cellKey);
                const isVisited = pathIdx !== undefined;
                const isHead = currentHead?.r === r && currentHead?.c === c;
                const isNextTarget = cp && cp.number === nextExpectedCheckpointNumber;
                const isFlashing = invalidFlash?.r === r && invalidFlash?.c === c;
                const isHinted = hintCell?.r === r && hintCell?.c === c;

                // Check if adjacent to head (for subtle guidance dot)
                const isAdjacentToHead =
                  currentHead &&
                  !isVisited &&
                  !isObstacle &&
                  ((Math.abs(currentHead.r - r) === 1 && currentHead.c === c) ||
                    (Math.abs(currentHead.c - c) === 1 && currentHead.r === r));

                return (
                  <div
                    key={cellKey}
                    data-row={r}
                    data-col={c}
                    className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl transition-colors duration-150 ${
                      isVisited
                        ? 'bg-indigo-50/50 border border-indigo-100/70 shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100/90 border border-stone-200/60 shadow-2xs'
                    } ${
                      isFlashing ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    } ${
                      isHinted ? 'ring-2 ring-amber-400 bg-amber-50 animate-pulse' : ''
                    }`}
                  >
                    {/* Subtle cul-de-sac dead-end indicator for unvisited cells */}
                    {isDeadEnd && !isVisited && !cp && (
                      <div className="absolute inset-1 sm:inset-1.5 rounded-lg sm:rounded-xl border-2 border-dashed border-[#C5BDB0] pointer-events-none flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A89F90]" />
                      </div>
                    )}

                    {/* Subtle guidance dot for adjacent available cells */}
                    {showAdjacentHints && isAdjacentToHead && !cp && (
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#6BAA75]/70 pointer-events-none animate-soft-pulse" />
                    )}

                    {/* Step order index */}
                    {showStepNumbers && isVisited && !cp && (
                      <span className="text-[10px] sm:text-xs font-mono tabular-nums text-[#8E97AB] font-bold pointer-events-none">
                        {pathIdx + 1}
                      </span>
                    )}

                    {/* Checkpoint Badge */}
                    {cp && (() => {
                      const colorDef = getCheckpointColor(cp.number);
                      const isPulsing =
                        activeCheckpointPulse?.r === cp.r &&
                        activeCheckpointPulse?.c === cp.c &&
                        activeCheckpointPulse?.number === cp.number;

                      const stateStyle = isVisited
                        ? colorDef.final
                        : isNextTarget
                        ? colorDef.active
                        : colorDef.inactive;

                      return (
                        <div className="relative z-20 flex items-center justify-center w-full h-full p-0.5">
                          {/* Pulse/ripple when reached */}
                          {isPulsing && (
                            <span
                              key={`cp-pulse-${activeCheckpointPulse.id}`}
                              className="absolute -inset-1.5 sm:-inset-2.5 rounded-full border-3 animate-checkpoint-ripple pointer-events-none"
                              style={{ borderColor: colorDef.active.border }}
                            />
                          )}

                          {/* Pure pastel checkpoint circle:
                              - Inactive: Lighter pastel background & matching pastel border + text (no dark colors)
                              - Active / Next target: Vibrant active pastel color with gentle bounce & glow
                              - Visited: Final rich pastel badge
                          */}
                          <div
                            className={`flex items-center justify-center w-[78%] h-[78%] max-w-[38px] max-h-[38px] min-w-[24px] min-h-[24px] rounded-full font-mono text-xs sm:text-sm font-bold transition-all duration-200 pointer-events-none select-none ${
                              isVisited
                                ? 'ring-2 ring-white shadow-sm scale-100'
                                : isNextTarget
                                ? 'ring-3 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-offset-white animate-gentle-bounce scale-105 sm:scale-110 shadow-md'
                                : 'ring-1.5 ring-white/90 shadow-2xs scale-95 opacity-90'
                            } ${isPulsing ? 'scale-115 sm:scale-120' : ''}`}
                            style={{
                              backgroundColor: stateStyle.bg,
                              border: isNextTarget || isVisited ? `2.5px solid ${stateStyle.border}` : `2px solid ${stateStyle.border}`,
                              color: stateStyle.text,
                              ...(isNextTarget && stateStyle.glow
                                ? { boxShadow: `0 0 16px ${stateStyle.glow}` }
                                : {}),
                            }}
                          >
                            {cp.number}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Subtle indicator ring on path head cell */}
                    {isHead && !isCompleted && (
                      <div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 0 2.5px ${activeHeadColorDef.active.border}` }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Continuous SVG Drawn Line Overlay: physically connected with no gaps */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox={`0 0 ${boardDimensions.width} ${boardDimensions.height}`}
          >
            {/* Subtle line shadow for tactile game depth */}
            {svgPathData && (
              <path
                d={svgPathData}
                fill="none"
                stroke="rgba(30,37,74,0.07)"
                strokeWidth={Math.max(8, cellW * 0.28)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Tactile string border: slightly darker shade of each segment's path color */}
            {enablePathSegmentBorder && pathSections.map((section, idx) => (
              <path
                key={`section-border-${section.checkpointNumber}-${idx}`}
                d={section.d}
                fill="none"
                stroke={section.borderColor}
                strokeWidth={Math.max(6, cellW * 0.22) + Math.max(2.5, cellW * 0.055)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.88}
              />
            ))}

            {/* Primary drawn stroke sections with vibrant pastel checkpoint color */}
            {pathSections.map((section, idx) => (
              <path
                key={`section-${section.checkpointNumber}-${idx}`}
                d={section.d}
                fill="none"
                stroke={section.colorDef.hexLight}
                strokeWidth={Math.max(6, cellW * 0.22)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Clean head dot matching active drawing color at the exact end of the path */}
            {currentHead && !isCompleted && (() => {
              const headBorderColor = getPathSegmentBorderColor
                ? getPathSegmentBorderColor(activeHeadCpNum)
                : (activeHeadColorDef.stringBorderColor || activeHeadColorDef.hexDark);
              const headRadius = Math.max(4, cellW * 0.12);

              return (
                <g key={`head-group-${currentHead.r}-${currentHead.c}`}>
                  {enablePathSegmentBorder && (
                    <circle
                      cx={currentHead.c * cellW + cellW / 2}
                      cy={currentHead.r * cellH + cellH / 2}
                      r={headRadius + 1.6}
                      fill={headBorderColor}
                      opacity={0.9}
                    />
                  )}
                  <circle
                    cx={currentHead.c * cellW + cellW / 2}
                    cy={currentHead.r * cellH + cellH / 2}
                    r={headRadius}
                    fill={activeHeadColorDef.hexLight}
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                  />
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MINIMAL & FUN CHECKPOINT STATUS BAR                      */}
      {/* ========================================================= */}
      <div className="w-full mt-2.5 bg-white rounded-2xl border border-stone-200/80 shadow-xs px-3.5 py-2 flex items-center justify-between gap-2">
        {/* Next Target Checkpoint with playful gem ring */}
        <div className="flex items-center gap-2">
          {nextExpectedCheckpointNumber <= checkpoints.length ? (() => {
            const targetStyle = getCheckpointNumberStyle(nextExpectedCheckpointNumber, false, true);
            return (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-stone-500">Target:</span>
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs shadow-xs animate-gentle-bounce"
                  style={{
                    backgroundColor: targetStyle.bg,
                    border: `1.5px solid ${targetStyle.border}`,
                    color: targetStyle.text,
                    boxShadow: targetStyle.glow ? `0 0 10px ${targetStyle.glow}` : undefined,
                  }}
                >
                  <Target className="w-3 h-3 stroke-[2.5]" style={{ stroke: targetStyle.text }} />
                  <span className="font-mono-numbers">
                    #{nextExpectedCheckpointNumber}
                  </span>
                </div>
              </div>
            );
          })() : (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs shadow-xs animate-soft-pulse">
              <Sparkles className="w-3 h-3 fill-emerald-500 text-emerald-600" />
              <span>Connect #{checkpoints.length} & Clear!</span>
            </div>
          )}

          {/* Micro milestone dots: All in pure pastel tones without dark colors */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            {checkpoints.map((cp) => {
              const isReached = visitedCheckpoints.has(cp.number);
              const isNext = cp.number === nextExpectedCheckpointNumber;
              const style = getCheckpointNumberStyle(cp.number, isReached, isNext);
              return (
                <div
                  key={`micro-dot-${cp.number}`}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    isNext ? 'scale-110 shadow-xs ring-1 ring-white' : 'scale-95'
                  }`}
                  style={{
                    backgroundColor: style.bg,
                    border: `1.2px solid ${style.border}`,
                    color: style.text,
                    ...(isNext && style.glow ? { boxShadow: `0 0 6px ${style.glow}` } : {}),
                  }}
                  title={`Checkpoint ${cp.number} (${isReached ? 'Reached' : isNext ? 'Target' : 'Light Pastel Inactive'})`}
                >
                  {isReached ? '✓' : cp.number}
                </div>
              );
            })}
          </div>
        </div>

        {/* Board Fill Progress */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((path.length / totalCells) * 100))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-stone-600 font-mono-numbers">
            {path.length}/{totalCells}
          </span>
        </div>
      </div>
    </div>
  );
};
