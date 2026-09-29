export interface CheckpointStateStyle {
  bg: string;
  border: string;
  text: string;
  ring: string;
  glow?: string;
}

export interface CheckpointColorDef {
  number: number;
  name: string;
  strokeClass: string;
  fillClass: string;
  bgClass: string;
  ringClass: string;
  textClass: string;
  hexLight: string;
  hexDark: string;
  stringBorderColor?: string;

  // 3 distinct pastel states (no dark colors, pure soft pastels):
  // - inactive: subtle, lighter pastel tint
  // - active: bright active pastel tone with glowing ring when next target
  // - final: full rich pastel when reached and connected
  inactive: CheckpointStateStyle;
  active: CheckpointStateStyle;
  final: CheckpointStateStyle;
}

/**
 * Pure pastel palette with zero harsh or dark colors:
 * 1 = Pastel Buttercup Yellow
 * 2 = Pastel Mint Garden Green (lighter green in inactive state, active green when targeted)
 * 3 = Pastel Apricot Peach
 * 4 = Pastel Lilac Lavender
 * 5 = Pastel Candy Pink
 * 6 = Pastel Sky Blue
 * 7 = Pastel Seafoam Turquoise
 * 8 = Pastel Soft Rose
 */
export const CHECKPOINT_COLORS: Record<number, CheckpointColorDef> = {
  1: {
    number: 1,
    name: 'Pastel Yellow',
    strokeClass: 'stroke-[#FACC15]',
    fillClass: 'fill-[#FACC15]',
    bgClass: 'bg-[#FACC15]',
    ringClass: 'ring-[#FACC15]/40',
    textClass: 'text-[#713F12]',
    hexLight: '#FACC15',
    hexDark: '#EAB308',
    stringBorderColor: '#D97706',
    inactive: {
      bg: '#FEF9C3',
      border: '#FDE047',
      text: '#854D0E',
      ring: 'rgba(253, 224, 71, 0.45)',
    },
    active: {
      bg: '#FDE047',
      border: '#EAB308',
      text: '#713F12',
      ring: 'rgba(234, 179, 8, 0.55)',
      glow: 'rgba(250, 204, 21, 0.65)',
    },
    final: {
      bg: '#FACC15',
      border: '#EAB308',
      text: '#713F12',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  2: {
    number: 2,
    name: 'Pastel Green',
    strokeClass: 'stroke-[#4ADE80]',
    fillClass: 'fill-[#4ADE80]',
    bgClass: 'bg-[#4ADE80]',
    ringClass: 'ring-[#4ADE80]/40',
    textClass: 'text-[#14532D]',
    hexLight: '#4ADE80',
    hexDark: '#22C55E',
    stringBorderColor: '#16A34A',
    inactive: {
      bg: '#DCFCE7', // Lighter pastel green in inactive state
      border: '#86EFAC',
      text: '#15803D',
      ring: 'rgba(134, 239, 172, 0.45)',
    },
    active: {
      bg: '#86EFAC', // Active vibrant green
      border: '#4ADE80',
      text: '#14532D',
      ring: 'rgba(74, 222, 128, 0.55)',
      glow: 'rgba(74, 222, 128, 0.65)',
    },
    final: {
      bg: '#4ADE80', // Full final green
      border: '#22C55E',
      text: '#14532D',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  3: {
    number: 3,
    name: 'Pastel Peach',
    strokeClass: 'stroke-[#FB923C]',
    fillClass: 'fill-[#FB923C]',
    bgClass: 'bg-[#FB923C]',
    ringClass: 'ring-[#FB923C]/40',
    textClass: 'text-[#431407]',
    hexLight: '#FB923C',
    hexDark: '#F97316',
    stringBorderColor: '#EA580C',
    inactive: {
      bg: '#FFEDD5',
      border: '#FDBA74',
      text: '#C2410C',
      ring: 'rgba(253, 186, 116, 0.45)',
    },
    active: {
      bg: '#FDBA74',
      border: '#FB923C',
      text: '#9A3412',
      ring: 'rgba(251, 146, 60, 0.55)',
      glow: 'rgba(251, 146, 60, 0.65)',
    },
    final: {
      bg: '#FB923C',
      border: '#F97316',
      text: '#431407',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  4: {
    number: 4,
    name: 'Pastel Lavender',
    strokeClass: 'stroke-[#C084FC]',
    fillClass: 'fill-[#C084FC]',
    bgClass: 'bg-[#C084FC]',
    ringClass: 'ring-[#C084FC]/40',
    textClass: 'text-[#3B0764]',
    hexLight: '#C084FC',
    hexDark: '#A855F7',
    stringBorderColor: '#9333EA',
    inactive: {
      bg: '#F3E8FF',
      border: '#D8B4FE',
      text: '#7E22CE',
      ring: 'rgba(216, 180, 254, 0.45)',
    },
    active: {
      bg: '#D8B4FE',
      border: '#C084FC',
      text: '#6B21A8',
      ring: 'rgba(192, 132, 252, 0.55)',
      glow: 'rgba(192, 132, 252, 0.65)',
    },
    final: {
      bg: '#C084FC',
      border: '#A855F7',
      text: '#3B0764',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  5: {
    number: 5,
    name: 'Pastel Pink',
    strokeClass: 'stroke-[#F472B6]',
    fillClass: 'fill-[#F472B6]',
    bgClass: 'bg-[#F472B6]',
    ringClass: 'ring-[#F472B6]/40',
    textClass: 'text-[#500724]',
    hexLight: '#F472B6',
    hexDark: '#EC4899',
    stringBorderColor: '#DB2777',
    inactive: {
      bg: '#FCE7F3',
      border: '#F9A8D4',
      text: '#BE185D',
      ring: 'rgba(249, 168, 212, 0.45)',
    },
    active: {
      bg: '#F9A8D4',
      border: '#F472B6',
      text: '#9D174D',
      ring: 'rgba(244, 114, 182, 0.55)',
      glow: 'rgba(244, 114, 182, 0.65)',
    },
    final: {
      bg: '#F472B6',
      border: '#EC4899',
      text: '#500724',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  6: {
    number: 6,
    name: 'Pastel Sky Blue',
    strokeClass: 'stroke-[#38BDF8]',
    fillClass: 'fill-[#38BDF8]',
    bgClass: 'bg-[#38BDF8]',
    ringClass: 'ring-[#38BDF8]/40',
    textClass: 'text-[#0C4A6E]',
    hexLight: '#38BDF8',
    hexDark: '#0284C7',
    stringBorderColor: '#0284C7',
    inactive: {
      bg: '#E0F2FE',
      border: '#7DD3FC',
      text: '#0369A1',
      ring: 'rgba(125, 211, 252, 0.45)',
    },
    active: {
      bg: '#7DD3FC',
      border: '#38BDF8',
      text: '#075985',
      ring: 'rgba(56, 189, 248, 0.55)',
      glow: 'rgba(56, 189, 248, 0.65)',
    },
    final: {
      bg: '#38BDF8',
      border: '#0284C7',
      text: '#0C4A6E',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  7: {
    number: 7,
    name: 'Pastel Seafoam',
    strokeClass: 'stroke-[#2DD4BF]',
    fillClass: 'fill-[#2DD4BF]',
    bgClass: 'bg-[#2DD4BF]',
    ringClass: 'ring-[#2DD4BF]/40',
    textClass: 'text-[#134E4A]',
    hexLight: '#2DD4BF',
    hexDark: '#14B8A6',
    stringBorderColor: '#0D9488',
    inactive: {
      bg: '#CCFBF1',
      border: '#5EEAD4',
      text: '#0F766E',
      ring: 'rgba(94, 234, 212, 0.45)',
    },
    active: {
      bg: '#5EEAD4',
      border: '#2DD4BF',
      text: '#115E59',
      ring: 'rgba(45, 212, 191, 0.55)',
      glow: 'rgba(45, 212, 191, 0.65)',
    },
    final: {
      bg: '#2DD4BF',
      border: '#14B8A6',
      text: '#134E4A',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
  8: {
    number: 8,
    name: 'Pastel Soft Rose',
    strokeClass: 'stroke-[#FB7185]',
    fillClass: 'fill-[#FB7185]',
    bgClass: 'bg-[#FB7185]',
    ringClass: 'ring-[#FB7185]/40',
    textClass: 'text-[#4C0519]',
    hexLight: '#FB7185',
    hexDark: '#F43F5E',
    stringBorderColor: '#E11D48',
    inactive: {
      bg: '#FFE4E6',
      border: '#FDA4AF',
      text: '#BE123C',
      ring: 'rgba(253, 164, 175, 0.45)',
    },
    active: {
      bg: '#FDA4AF',
      border: '#FB7185',
      text: '#9F1239',
      ring: 'rgba(251, 113, 133, 0.55)',
      glow: 'rgba(251, 113, 133, 0.65)',
    },
    final: {
      bg: '#FB7185',
      border: '#F43F5E',
      text: '#4C0519',
      ring: 'rgba(255, 255, 255, 0.95)',
    },
  },
};

export function getCheckpointColor(num: number): CheckpointColorDef {
  if (CHECKPOINT_COLORS[num]) {
    return CHECKPOINT_COLORS[num];
  }
  const fallbackIndex = (((num - 1) % 8) + 8) % 8 + 1;
  return CHECKPOINT_COLORS[fallbackIndex] || CHECKPOINT_COLORS[1];
}

/**
 * Returns a slightly darker shade of the current path color for subtle segment stroke/border
 * to enhance the tactile string-like appearance.
 */
export function getPathSegmentBorderColor(checkpointNumber: number): string {
  const def = getCheckpointColor(checkpointNumber);
  return def.stringBorderColor || def.hexDark;
}

/**
 * Returns the exact pastel state style for a numbered checkpoint:
 * - 'inactive': light pastel background & pastel border (no dark tones)
 * - 'active': vibrant pastel tone with glow ring
 * - 'final': rich saturated pastel badge
 */
export function getCheckpointNumberStyle(
  checkpointNumber: number,
  isVisited: boolean,
  isNextTarget: boolean
): CheckpointStateStyle {
  const def = getCheckpointColor(checkpointNumber);
  if (isVisited) return def.final;
  if (isNextTarget) return def.active;
  return def.inactive;
}
