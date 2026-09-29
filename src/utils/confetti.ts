import confetti from 'canvas-confetti';

/**
 * Playful, colorful confetti explosion matching the app's soft pastel palette.
 * Uses a double-cannon burst from both sides followed by a soft golden star shower.
 */
export const triggerPlayfulConfetti = () => {
  if (typeof window === 'undefined') return;

  const pastelColors = [
    '#A78BFA', // pastel purple
    '#F472B6', // candy pink
    '#38BDF8', // sky blue
    '#34D399', // mint green
    '#FBBF24', // sunshine amber
    '#FB923C', // peach coral
  ];

  // Star shape
  const starShape = confetti.shapeFromPath({
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  });

  // 1. First cannon from bottom-left
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.8 },
    colors: pastelColors,
    shapes: ['circle', starShape],
    scalar: 1.1,
    ticks: 180,
    gravity: 1.1,
    drift: 0.1,
    disableForReducedMotion: true,
  });

  // 2. Second cannon from bottom-right (simultaneous)
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.8 },
    colors: pastelColors,
    shapes: ['circle', starShape],
    scalar: 1.1,
    ticks: 180,
    gravity: 1.1,
    drift: -0.1,
    disableForReducedMotion: true,
  });

  // 3. Gentle center burst of shimmering stars after 200ms
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 80,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FBBF24', '#F472B6', '#38BDF8', '#C084FC'],
      shapes: [starShape, 'circle'],
      scalar: 1.25,
      ticks: 150,
      gravity: 0.9,
      disableForReducedMotion: true,
    });
  }, 220);
};
