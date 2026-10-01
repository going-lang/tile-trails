import { SaveSystem } from './saveSystem';

export type MusicMood = 'menu' | 'puzzle' | 'intense' | 'victory' | 'cosmic';

interface MoodConfig {
  bpm: number;
  chordProgression: number[][]; // MIDI note numbers
  scale: number[]; // MIDI offsets for melody
  padWave: OscillatorType;
  leadWave: OscillatorType;
  padVolume: number;
  leadVolume: number;
  bassVolume: number;
}

const MOODS: Record<MusicMood, MoodConfig> = {
  // Warm, welcoming lydian lullaby for menus & home screen
  menu: {
    bpm: 62,
    chordProgression: [
      [48, 55, 64, 71], // Cmaj7
      [45, 52, 60, 67], // Am7
      [50, 57, 65, 72], // Dm add9
      [43, 50, 59, 66], // G sus
    ],
    scale: [72, 74, 76, 78, 79, 81, 83, 84],
    padWave: 'sine',
    leadWave: 'triangle',
    padVolume: 0.055,
    leadVolume: 0.045,
    bassVolume: 0.05,
  },
  // Focused, flowing pentatonic trail theme for gameplay
  puzzle: {
    bpm: 70,
    chordProgression: [
      [48, 55, 62, 67], // C
      [53, 60, 67, 72], // F
      [45, 52, 59, 64], // Am
      [50, 57, 64, 69], // Dm
    ],
    scale: [72, 74, 76, 79, 81, 84, 86, 88],
    padWave: 'sine',
    leadWave: 'sine',
    padVolume: 0.05,
    leadVolume: 0.042,
    bassVolume: 0.048,
  },
  // Slightly brighter tempo for higher worlds & challenging stages
  intense: {
    bpm: 80,
    chordProgression: [
      [50, 57, 65, 69], // Dm7
      [48, 55, 63, 67], // Cm7
      [52, 59, 67, 71], // Em
      [46, 53, 60, 65], // Bb
    ],
    scale: [74, 76, 77, 79, 81, 84, 86, 89],
    padWave: 'triangle',
    leadWave: 'triangle',
    padVolume: 0.048,
    leadVolume: 0.04,
    bassVolume: 0.05,
  },
  // Celebratory fanfare-adjacent pad used after level clears
  victory: {
    bpm: 88,
    chordProgression: [
      [48, 55, 64, 72], // C major spread
      [53, 60, 69, 77], // F major spread
      [55, 62, 71, 79], // G major spread
      [48, 55, 64, 72], // C major
    ],
    scale: [72, 76, 79, 84, 88, 91, 96, 100],
    padWave: 'sine',
    leadWave: 'triangle',
    padVolume: 0.06,
    leadVolume: 0.05,
    bassVolume: 0.055,
  },
  // Deep ambient drone for Space Station & Galaxy worlds
  cosmic: {
    bpm: 54,
    chordProgression: [
      [45, 52, 61, 68], // Am add11
      [43, 50, 59, 68], // G add9
      [41, 48, 57, 64], // Fmaj9
      [43, 52, 59, 66], // G sus
    ],
    scale: [69, 72, 74, 76, 79, 81, 84, 86],
    padWave: 'sine',
    leadWave: 'sine',
    padVolume: 0.058,
    leadVolume: 0.036,
    bassVolume: 0.05,
  },
};

const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;

  private schedulerId: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private currentMood: MusicMood = 'menu';
  private pendingMood: MusicMood | null = null;
  private isMusicPlaying = false;

  private unlockInstalled = false;

  /**
   * Android/iOS WebViews only allow audio after a user gesture. We install one-time
   * listeners that resume the context on the first touch anywhere, so music starts
   * reliably without the player having to tap a specific "enable sound" button.
   */
  private installGestureUnlock() {
    if (this.unlockInstalled || typeof window === 'undefined') return;
    this.unlockInstalled = true;
    const unlock = () => {
      const ctx = this.ctx;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Once running we no longer need the listeners
      if (ctx && ctx.state === 'running') {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  // Gentle low-pass master tone so everything sounds soft & rounded
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        // Some restricted WebViews throw — fail silently; the game stays fully playable
        return null;
      }
      this.installGestureUnlock();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;

      // Soft high-frequency roll-off for a warm relaxing tone
      const tone = this.ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 7200;
      tone.Q.value = 0.4;

      this.masterGain.connect(tone);
      tone.connect(this.ctx.destination);

      // Separate music bus with its own volume for independent ducking
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 1;
      this.musicBus.connect(this.masterGain);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 1;
      this.sfxBus.connect(this.masterGain);

      // Ambient echo / space for relaxing depth
      this.delayNode = this.ctx.createDelay(1.5);
      this.delayNode.delayTime.value = 0.42;
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.value = 0.32;
      this.delayWet = this.ctx.createGain();
      this.delayWet.gain.value = 0.28;

      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWet);
      this.delayWet.connect(this.musicBus);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private get sfxTarget(): AudioNode {
    this.ensureContext();
    return this.sfxBus || this.ctx!.destination;
  }

  public vibrate(ms: number | number[] = 18) {
    const settings = SaveSystem.get().settings;
    if (!settings.vibration) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {
      // Ignore unsupported devices
    }
  }

  // ============== SOUND EFFECTS ==============

  public playButtonClick() {
    this.vibrate(10);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.055);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxTarget);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playTileTap(layer = 0) {
    this.vibrate(14);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = 392 + (layer % 5) * 26;

    // Warm wooden marimba pop with a soft attack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxTarget);
    osc.start(now);
    osc.stop(now + 0.105);
  }

  public playTileSlide() {
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(470, now + 0.11);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxTarget);
    osc.start(now);
    osc.stop(now + 0.125);
  }

  public playBlockedTap() {
    this.vibrate([20, 30, 20]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(168, now);
    osc.frequency.linearRampToValueAtTime(126, now + 0.09);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxTarget);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playTripleMatch(combo = 1) {
    this.vibrate([18, 25, 30]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pitchMultiplier = Math.pow(1.059463, Math.min(combo - 1, 8));
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + idx * 0.055;
      osc.frequency.setValueAtTime(freq * pitchMultiplier, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.19, startTime + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      // Dry signal only — no echo/decay tail on match dings
      gain.connect(this.sfxTarget);
      osc.start(startTime);
      osc.stop(startTime + 0.32);
    });
  }

  public playPowerUp() {
    this.vibrate([15, 20, 40]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.04;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playCoinReward() {
    this.vibrate(15);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.07;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.17, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  }

  /** Soft two-note warning when the tray is one slot from full */
  public playTrayWarning() {
    this.vibrate([12, 40, 12]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [[440, 0], [370, 0.13]].forEach(([freq, offset]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + offset;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.11, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  /** Gentle rising chime when a covered tile is revealed */
  public playReveal() {
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.14);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.sfxTarget);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Background handling: duck the music, then fully suspend the AudioContext so the
   * WebView isn't burning CPU/battery scheduling notes nobody can hear. On return we
   * resume the context and re-sync the note cursor so playback picks up cleanly.
   */
  public setBackgrounded(hidden: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;

    if (hidden) {
      this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      window.setTimeout(() => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      }, 300);
    } else {
      const resume = () => {
        if (!this.ctx) return;
        // Re-align the scheduler so it doesn't try to catch up on missed notes
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        if (this.musicBus) {
          this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
          this.musicBus.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          this.musicBus.gain.linearRampToValueAtTime(SaveSystem.get().settings.music ? 1 : 0.0001, this.ctx.currentTime + 0.6);
        }
      };
      if (ctx.state === 'suspended') {
        ctx.resume().then(resume).catch(() => {});
      } else {
        resume();
      }
    }
  }

  public playAchievementUnlock() {
    this.vibrate([20, 30, 20, 30, 50]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Bright ascending achievement fanfare arpeggio
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.075;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playLevelWin() {
    this.vibrate([30, 40, 60, 40, 90]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12, t: 0.0 },
      { f: 659.25, d: 0.12, t: 0.11 },
      { f: 783.99, d: 0.12, t: 0.22 },
      { f: 1046.5, d: 0.38, t: 0.34 },
      { f: 783.99, d: 0.12, t: 0.52 },
      { f: 1046.5, d: 0.55, t: 0.65 },
    ];

    melody.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + n.t;
      osc.frequency.setValueAtTime(n.f, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(start);
      osc.stop(start + n.d + 0.02);
    });
  }

  public playLevelLose() {
    this.vibrate([50, 50, 120]);
    if (!SaveSystem.get().settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 329.63, 261.63];
    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.16;
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxTarget);
      osc.start(start);
      osc.stop(start + 0.27);
    });
  }

  // ============== RELAXING ADAPTIVE BACKGROUND MUSIC ==============

  public setMood(mood: MusicMood) {
    if (this.currentMood === mood) return;
    this.pendingMood = mood;
  }

  private getMood(): MoodConfig {
    return MOODS[this.pendingMood ?? this.currentMood];
  }

  private commitMood() {
    if (this.pendingMood) {
      this.currentMood = this.pendingMood;
      this.pendingMood = null;
    }
  }

  /** Soft evolving ambient pad chord (slow attack, long release) */
  private schedulePad(freqs: number[], startTime: number, duration: number, volume: number) {
    const ctx = this.ctx!;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = this.getMood().padWave;
      // Gentle detune for a wide, warm chorus-like pad
      osc.frequency.value = freq;
      osc.detune.value = (idx - 1.5) * 5;

      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      filter.Q.value = 0.6;

      const peak = volume / Math.max(2, freqs.length * 0.7);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + duration * 0.35);
      gain.gain.setValueAtTime(peak, startTime + duration * 0.68);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicBus!);
      gain.connect(this.delayNode as DelayNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  /** Deep round bass foundation note */
  private scheduleBass(freq: number, startTime: number, duration: number, volume: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicBus!);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /** Sparkling kalimba / celesta melody note */
  private scheduleLead(freq: number, startTime: number, volume: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = this.getMood().leadWave;
    osc.frequency.value = freq;

    // Quiet octave-up shimmer for a glassy celesta feel
    shimmer.type = 'sine';
    shimmer.frequency.value = freq * 2;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.1);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.3;

    osc.connect(gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gain);
    gain.connect(this.musicBus!);
    gain.connect(this.delayNode as DelayNode);

    osc.start(startTime);
    shimmer.start(startTime);
    osc.stop(startTime + 1.15);
    shimmer.stop(startTime + 1.15);
  }

  /** Starts the smooth look-ahead scheduler that keeps music gapless */
  private startScheduler() {
    if (this.schedulerId !== null) return;

    this.nextNoteTime = this.ctx!.currentTime + 0.1;

    this.schedulerId = window.setInterval(() => {
      if (!this.ctx) return;
      const settings = SaveSystem.get().settings;
      if (!settings.music || !this.isMusicPlaying) return;

      const mood = this.getMood();
      const beat = 60 / mood.bpm;
      const barDuration = beat * 4;

      // If the tab was throttled/backgrounded, the scheduler clock can fall far behind
      // the audio clock. Instead of burst-playing every missed note at once (loud mush),
      // jump the cursor forward and resume cleanly on the next beat boundary.
      if (this.nextNoteTime < this.ctx.currentTime - 0.5) {
        const missedBeats = Math.ceil((this.ctx.currentTime - this.nextNoteTime) / beat);
        this.nextNoteTime += missedBeats * beat;
        this.currentStep += missedBeats;
      }

      // Schedule slightly ahead so there is never a gap between notes
      while (this.nextNoteTime < this.ctx.currentTime + 0.6) {
        this.commitMood();
        const activeMood = this.getMood();

        const stepInBar = this.currentStep % 4;
        const chord = activeMood.chordProgression[Math.floor(this.currentStep / 4) % activeMood.chordProgression.length];

        if (stepInBar === 0) {
          // New bar: sustained pad + deep bass root
          this.schedulePad(
            chord.map((n) => midiToFreq(n)),
            this.nextNoteTime,
            barDuration * 1.15,
            activeMood.padVolume
          );
          this.scheduleBass(midiToFreq(chord[0] - 12), this.nextNoteTime, barDuration * 0.95, activeMood.bassVolume);
        } else if (stepInBar === 2) {
          // Soft mid-bar bass pulse for gentle movement
          this.scheduleBass(midiToFreq(chord[1] - 12), this.nextNoteTime, beat * 1.4, activeMood.bassVolume * 0.7);
        }

        // Flowing melody: pick 1-2 dreamy notes per beat from the mood scale
        const melodyDensity = this.currentStep % 2 === 0 ? 2 : 1;
        for (let n = 0; n < melodyDensity; n++) {
          if (Math.random() > 0.28) {
            const noteIdx = Math.floor(Math.random() * activeMood.scale.length);
            const note = activeMood.scale[noteIdx];
            this.scheduleLead(
              midiToFreq(note),
              this.nextNoteTime + n * (beat / melodyDensity) * 0.5,
              activeMood.leadVolume * (0.75 + Math.random() * 0.4)
            );
          }
        }

        this.nextNoteTime += beat;
        this.currentStep++;
      }
    }, 120);
  }

  public syncMusicState() {
    const musicEnabled = SaveSystem.get().settings.music;
    if (musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public startMusic() {
    if (!SaveSystem.get().settings.music) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    if (this.musicBus) {
      // Smooth fade-in so the music never startles the player
      this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      this.musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.6);
    }

    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.1;
    this.startScheduler();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    const ctx = this.ctx;
    if (ctx && this.musicBus) {
      // Smooth fade-out instead of an abrupt cut
      this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    }
  }

  public isMusicCurrentlyPlaying(): boolean {
    return this.isMusicPlaying;
  }
}

export const audio = new AudioManager();
