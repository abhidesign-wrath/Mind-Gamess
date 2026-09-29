/**
 * Comprehensive, playful audio feedback system using the Web Audio API.
 * Synthesizes crisp, high-fidelity sound effects for all interactions throughout the app:
 * - Ambient generative background music when not playing (tranquil kalimba & warm pad harmony)
 * - Pentatonic kalimba step notes
 * - Sparkling crystal checkpoint chimes
 * - Triumphant completion fanfares & sequential star chimes
 * - Tactile UI clicks, pops, modal transitions, and switch toggles
 * - Magical hint twinkles and easter egg interactions
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  private isMusicActive: boolean = false;
  private musicLoopTimeout: any = null;
  private chimeLoopTimeout: any = null;
  private chordIndex: number = 0;
  private currentScreen: 'HOME' | 'GAME' = 'HOME';

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock();
        if (this.currentScreen === 'HOME' && this.enabled && this.musicEnabled) {
          this.startMusic();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });

      // Tab visibility listener: soften/pause music when user switches tabs
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopMusic(0.2);
        } else if (this.currentScreen === 'HOME' && this.enabled && this.musicEnabled) {
          this.startMusic();
        }
      });
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (val) {
      this.initContext();
      if (this.currentScreen === 'HOME' && this.musicEnabled) {
        this.startMusic();
      }
    } else {
      this.stopMusic(0.1);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    if (val) {
      if (this.enabled && this.currentScreen === 'HOME') {
        this.startMusic();
      }
    } else {
      this.stopMusic(0.3);
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setScreen(screen: 'HOME' | 'GAME') {
    this.currentScreen = screen;
    if (screen === 'GAME') {
      // Smoothly silence background music when entering a puzzle
      this.stopMusic(0.5);
    } else if (screen === 'HOME') {
      // Gently fade ambient music back in on the map/home screen
      if (this.enabled && this.musicEnabled) {
        this.startMusic();
      }
    }
  }

  public unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();

          // SFX master gain
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);

          // Dedicated background music channel with low-pass warm filter
          this.musicGain = this.ctx.createGain();
          this.musicGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

          this.musicFilter = this.ctx.createBiquadFilter();
          this.musicFilter.type = 'lowpass';
          this.musicFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
          this.musicFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

          this.musicGain.connect(this.musicFilter);
          this.musicFilter.connect(this.ctx.destination);
        } catch {
          return false;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return Boolean(this.ctx && this.masterGain && this.musicGain);
  }

  /* -------------------------------------------------------------
   * Subtle Ambient Generative Music Engine (for Home / Map Screen)
   * ------------------------------------------------------------- */

  public startMusic() {
    if (!this.enabled || !this.musicEnabled) return;
    if (!this.initContext() || !this.ctx || !this.musicGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isMusicActive) {
      // Ensure target volume is faded in
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(0.055, now + 1.2);
      return;
    }

    this.isMusicActive = true;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value || 0.0001, now);
    this.musicGain.gain.linearRampToValueAtTime(0.055, now + 1.8);

    this.scheduleNextChord();
    this.scheduleNextMelodyNote();
  }

  public stopMusic(fadeDuration: number = 0.5) {
    if (!this.isMusicActive && (!this.musicGain || this.musicGain.gain.value < 0.001)) {
      this.isMusicActive = false;
      return;
    }

    this.isMusicActive = false;
    if (this.musicLoopTimeout) {
      clearTimeout(this.musicLoopTimeout);
      this.musicLoopTimeout = null;
    }
    if (this.chimeLoopTimeout) {
      clearTimeout(this.chimeLoopTimeout);
      this.chimeLoopTimeout = null;
    }

    if (this.ctx && this.musicGain) {
      try {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.05, fadeDuration));
      } catch {
        // Safe
      }
    }
  }

  /**
   * Schedules gentle, warm, peaceful ambient chords:
   * 1. Cmaj9 (C3, G3, B3, D4, E4)
   * 2. Fmaj7 (F2, C3, E3, A3, C4)
   * 3. Am9   (A2, E3, G3, C4, E4)
   * 4. Gsus4 (G2, D3, G3, C4, D4)
   */
  private scheduleNextChord() {
    if (!this.isMusicActive || !this.ctx || !this.musicGain) return;

    const chords = [
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
      [87.31, 130.81, 164.81, 220.00, 261.63],  // Fmaj7
      [110.00, 164.81, 196.00, 261.63, 329.63], // Am9
      [98.00, 146.83, 196.00, 261.63, 293.66],  // Gsus4
    ];

    const chord = chords[this.chordIndex % chords.length];
    this.chordIndex++;

    const now = this.ctx.currentTime;
    const duration = 4.2;

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Subtle micro-detune for lush acoustic warmth
        const detune = (idx - 2) * 2.5;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        const baseGain = idx === 0 ? 0.35 : 0.22;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(baseGain, now + 1.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      } catch {
        // Safe
      }
    });

    // Schedule next chord slightly before current one finishes for smooth overlap
    this.musicLoopTimeout = setTimeout(() => {
      this.scheduleNextChord();
    }, 3800);
  }

  /**
   * Generates sparse, gentle organic kalimba droplets on pentatonic frequencies
   */
  private scheduleNextMelodyNote() {
    if (!this.isMusicActive || !this.ctx || !this.musicGain) return;

    const pentatonicNotes = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
    ];

    const now = this.ctx.currentTime;
    const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
    const duration = 0.8 + Math.random() * 0.4;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.02);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);

      // Delicate overtone
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);
      overGain.gain.setValueAtTime(0.0001, now);
      overGain.gain.linearRampToValueAtTime(0.04, now + 0.008);
      overGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);

      overtone.connect(overGain);
      overGain.connect(this.musicGain);
      overtone.start(now);
      overtone.stop(now + duration * 0.55);
    } catch {
      // Safe
    }

    // Schedule next droplet at random interval (1.4s to 2.8s)
    const nextInterval = 1400 + Math.random() * 1400;
    this.chimeLoopTimeout = setTimeout(() => {
      this.scheduleNextMelodyNote();
    }, nextInterval);
  }

  /* -------------------------------------------------------------
   * Sound Effects (SFX)
   * ------------------------------------------------------------- */

  /**
   * Crisp, subtle micro-tap for UI buttons, icons, and navigation.
   */
  public playTap() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio safe
    }
  }

  /**
   * Bouncy, round bubble pop for badge clicks, level buttons, and interactive items.
   */
  public playPop(pitchRatio: number = 0.5) {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const baseFreq = 320 + pitchRatio * 280; // 320Hz to 600Hz

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 0.7, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.045);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio safe
    }
  }

  /**
   * Melodic, cheerful kalimba step sound.
   * Advances up a pentatonic scale as path extends.
   */
  public playPlop(progressRatio: number = 0) {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Pentatonic scale frequencies (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
      const pentatonic = [
        261.63, 293.66, 329.63, 392.00, 440.00,
        523.25, 587.33, 659.25, 783.99, 880.00,
      ];

      const noteIdx = Math.min(
        Math.floor(progressRatio * pentatonic.length),
        pentatonic.length - 1
      );
      const freq = pentatonic[Math.max(0, noteIdx)];

      // Warm sine oscillator with gentle harmonic (marimba/kalimba character)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.012);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.035);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);

      // Soft bell harmonic
      const harmonicOsc = this.ctx.createOscillator();
      const harmonicGain = this.ctx.createGain();

      harmonicOsc.type = 'sine';
      harmonicOsc.frequency.setValueAtTime(freq * 2, now);

      harmonicGain.gain.setValueAtTime(0.0001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.025, now + 0.003);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(this.masterGain);

      harmonicOsc.start(now);
      harmonicOsc.stop(now + 0.065);
    } catch {
      // Audio safe
    }
  }

  public playStep(progressRatio: number = 0) {
    this.playPlop(progressRatio);
  }

  /**
   * Cheerful, bright crystal chime when reaching a checkpoint.
   */
  public playChime(checkpointNumber: number = 1) {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const rootPitches = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
      const rootIndex = Math.max(0, Math.min((checkpointNumber || 1) - 1, rootPitches.length - 1));
      const root = rootPitches[rootIndex];

      const notes = [
        { freq: root, delay: 0, duration: 0.26, vol: 0.085 },
        { freq: root * 1.2599, delay: 0.035, duration: 0.3, vol: 0.09 },
        { freq: root * 1.5, delay: 0.07, duration: 0.36, vol: 0.095 },
      ];

      notes.forEach((note) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + note.delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(note.vol, noteStart + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + note.duration + 0.02);

        // Shimmer bell overtone
        const shimmer = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();

        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(note.freq * 2.5, noteStart);

        shimmerGain.gain.setValueAtTime(0.0001, noteStart);
        shimmerGain.gain.linearRampToValueAtTime(note.vol * 0.22, noteStart + 0.004);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration * 0.65);

        shimmer.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);

        shimmer.start(noteStart);
        shimmer.stop(noteStart + note.duration * 0.7);
      });
    } catch {
      // Audio safe
    }
  }

  public playCheckpoint(checkpointNumber: number = 1) {
    this.playChime(checkpointNumber);
  }

  /**
   * Gentle, soft backtrack pop when undoing a move.
   */
  public playBacktrack() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.038);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio safe
    }
  }

  /**
   * Gentle waterdrop descending spiral when resetting the board.
   */
  public playReset() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const resetPitches = [783.99, 659.25, 523.25, 392.00];

      resetPitches.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, noteStart + 0.06);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.04, noteStart + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.09);
      });
    } catch {
      // Audio safe
    }
  }

  /**
   * Magical sparkle chime when a hint is requested.
   */
  public playHint() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const hintPitches = [659.25, 880.00, 1174.66, 1567.98];

      hintPitches.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.06, noteStart + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.24);
      });
    } catch {
      // Audio safe
    }
  }

  /**
   * Celebratory victory fanfare arpeggio with celebratory chord resolution!
   */
  public playVictory() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const fanfarePitches = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

      fanfarePitches.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const startTime = now + idx * 0.06;
        const duration = 0.5 + idx * 0.06;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.075, startTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });

      // Final celebratory harmonic chord at end of fanfare
      const chordTime = now + 0.38;
      [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);

        gain.gain.setValueAtTime(0.0001, chordTime);
        gain.gain.linearRampToValueAtTime(0.04, chordTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(chordTime);
        osc.stop(chordTime + 0.65);
      });
    } catch {
      // Audio safe
    }
  }

  /**
   * Sparkling bell chime when stars 1, 2, 3 appear on the victory screen.
   */
  public playStar(starIndex: number = 1) {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const starPitches = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
      const freq = starPitches[Math.min(starIndex - 1, starPitches.length - 1)] || 1046.50;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);

      // Shimmer overtone
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();

      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, now);

      shimmerGain.gain.setValueAtTime(0.0001, now);
      shimmerGain.gain.linearRampToValueAtTime(0.025, now + 0.003);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.masterGain);

      shimmer.start(now);
      shimmer.stop(now + 0.2);
    } catch {
      // Audio safe
    }
  }

  /**
   * Energetic ascending chirp when launching or starting a level.
   */
  public playLevelStart() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const notes = [
        { freq: 440, start: now, dur: 0.08 },
        { freq: 659.25, start: now + 0.05, dur: 0.14 },
      ];

      notes.forEach((n) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, n.start);

        gain.gain.setValueAtTime(0.0001, n.start);
        gain.gain.linearRampToValueAtTime(0.065, n.start + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, n.start + n.dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(n.start);
        osc.stop(n.start + n.dur + 0.02);
      });
    } catch {
      // Audio safe
    }
  }

  /**
   * Gentle, warm bell swell when a modal opens.
   */
  public playModalOpen() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio safe
    }
  }

  /**
   * Soft dismiss tap when a modal closes.
   */
  public playModalClose() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio safe
    }
  }

  /**
   * Crisp toggle switch sound (higher tone for ON, lower tone for OFF).
   */
  public playToggle(isOn: boolean) {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (isOn) {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.04);
      } else {
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio safe
    }
  }

  /**
   * Triumphant reward chime when equipping or unlocking a badge.
   */
  public playBadgeReward() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const rewardPitches = [659.25, 880.00, 1318.51]; // E5, A5, E6

      rewardPitches.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.07, noteStart + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {
      // Audio safe
    }
  }

  /**
   * Crisp ping when sharing/copying results.
   */
  public playShare() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1174.66, now);
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio safe
    }
  }

  /**
   * Playful easter egg sound effects for cartoon map sprites.
   */
  public playEasterEgg(type: 'duck' | 'bunny' | 'campfire' | 'balloon' | 'windmill' | 'castle' | 'fanfare' = 'balloon') {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      if (type === 'duck') {
        // Playful cartoon double quack
        [0, 0.11].forEach((delay) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(420, now + delay);
          osc.frequency.exponentialRampToValueAtTime(320, now + delay + 0.07);

          gain.gain.setValueAtTime(0.0001, now + delay);
          gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.08);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.09);
        });
      } else if (type === 'bunny') {
        // Light double boing
        [0, 0.09].forEach((delay, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const freq = idx === 0 ? 550 : 720;
          osc.frequency.setValueAtTime(freq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + delay + 0.05);

          gain.gain.setValueAtTime(0.0001, now + delay);
          gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.07);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        });
      } else if (type === 'castle' || type === 'fanfare') {
        this.playVictory();
      } else {
        this.playPop(0.8);
      }
    } catch {
      // Audio safe
    }
  }

  /**
   * Soft tactile bonk for invalid attempt or locked level.
   */
  public playInvalid() {
    if (!this.enabled) return;
    try {
      if (!this.initContext() || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Audio safe
    }
  }
}

export const sound = new SoundEngine();
