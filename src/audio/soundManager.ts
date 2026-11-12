/**
 * Modular Audio & Sound Manager
 * Handles preloaded audio buffers and Web Audio synthesis for instantaneous, 100% reliable game audio
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private diceBuffer: AudioBuffer | null = null;
  private pawnOpenBuffer: AudioBuffer | null = null;
  private pawnStepBuffer: AudioBuffer | null = null;
  private isPreloading: boolean = false;

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ludo_sound_muted') : null;
    this.muted = saved === 'true';

    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        if (!this.isPreloading) {
          this.preloadSounds();
        }
      };
      window.addEventListener('click', unlockAudio, { once: false, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: false, passive: true });

      // Start preloading immediately
      this.preloadSounds();
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private async preloadSounds() {
    if (this.isPreloading || typeof window === 'undefined') return;
    this.isPreloading = true;

    const ctx = this.initCtx();

    // Preload dice_roll.wav
    try {
      const res = await fetch('/assets/sounds/dice_roll.wav');
      if (res.ok) {
        const arr = await res.arrayBuffer();
        if (ctx) {
          this.diceBuffer = await ctx.decodeAudioData(arr);
        }
      }
    } catch {
      // ignore
    }

    // Preload pawn step sound (crisp tick)
    try {
      const res = await fetch('/assets/sounds/pawn_step.wav');
      if (res.ok && ctx) {
        const arr = await res.arrayBuffer();
        this.pawnStepBuffer = await ctx.decodeAudioData(arr);
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/assets/sounds/pawn_open.mp3');
      if (res.ok && ctx) {
        const arr = await res.arrayBuffer();
        this.pawnOpenBuffer = await ctx.decodeAudioData(arr);
      }
    } catch {
      // ignore
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludo_sound_muted', String(this.muted));
    }
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  public playClick(pitch: number = 480) {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  public playSelect() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.setValueAtTime(880.00, t + 0.06); // A5
      osc.frequency.setValueAtTime(1174.66, t + 0.12); // D6

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(t + 0.25);
    } catch {
      // ignore
    }
  }

  public playCoin() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(t + 0.28);
    } catch {
      // ignore
    }
  }

  public playFanfare() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0.2, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  public playPawnOpen() {
    this.playPawnStep();
  }

  public playPawnStep() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      if (this.pawnStepBuffer && ctx && ctx.state === 'running') {
        const src = ctx.createBufferSource();
        src.buffer = this.pawnStepBuffer;
        const gain = ctx.createGain();
        gain.gain.value = 1.0;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(0);
        return;
      }
      const audio = new Audio('/assets/sounds/pawn_step.wav');
      audio.volume = 1.0;
      audio.play().catch(() => this.playClick(500));
    } catch {
      this.playClick(500);
    }
  }

  public playDiceRoll() {
    if (this.muted) return;

    let played = false;
    const ctx = this.initCtx();

    // Strategy 1: Preloaded Web Audio buffer (Immediate, 0ms latency, always unblocked)
    if (this.diceBuffer && ctx && ctx.state === 'running') {
      try {
        const src = ctx.createBufferSource();
        src.buffer = this.diceBuffer;
        const gain = ctx.createGain();
        gain.gain.value = 1.0;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(0);
        played = true;
      } catch {
        played = false;
      }
    }

    // Strategy 2: HTMLAudioElement with immediate playback
    if (!played) {
      try {
        const audio = new Audio('/assets/sounds/dice_roll.wav');
        audio.volume = 1.0;
        audio.play().then(() => {
          played = true;
        }).catch(() => {
          // If rejected, trigger immediate synthesizer
          this.synthesizeDiceRoll();
        });
      } catch {
        this.synthesizeDiceRoll();
      }
    }
  }

  private synthesizeDiceRoll() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      // 8 crisp randomized rattle clicks mimicking tumbling dice on board (spanning 440ms)
      for (let i = 0; i < 8; i++) {
        const offset = i * 0.046 + Math.random() * 0.010;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(320 + Math.random() * 380, t + offset);
        gain.gain.setValueAtTime(0.22, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.040);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.040);
      }
      // Final solid snap/landing impact sound at 0.38s settling at 0.44s
      const landOsc = ctx.createOscillator();
      const landGain = ctx.createGain();
      landOsc.type = 'triangle';
      landOsc.frequency.setValueAtTime(180, t + 0.38);
      landOsc.frequency.exponentialRampToValueAtTime(80, t + 0.44);
      landGain.gain.setValueAtTime(0.28, t + 0.38);
      landGain.gain.exponentialRampToValueAtTime(0.001, t + 0.44);
      landOsc.connect(landGain);
      landGain.connect(ctx.destination);
      landOsc.start(t + 0.38);
      landOsc.stop(t + 0.44);
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundManager();
