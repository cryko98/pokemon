// Retro Sound Effects using Web Audio API

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialized when first sound plays to obey browser autoplay policies
  }

  private initCtx() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  public toggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, slideTo?: number) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Resume if suspended by browser autoplay protection
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (error) {
      console.error('Failed to play retro tone', error);
    }
  }

  public playJump() {
    // Ascending slide
    this.playTone(180, 'triangle', 0.15, 0.12, 400);
  }

  public playHit() {
    // Short crunch frequency sweep
    this.playTone(150, 'sawtooth', 0.1, 0.15, 60);
  }

  public playHeavyHit() {
    // Powerful deep explosion sweep
    this.playTone(100, 'sawtooth', 0.25, 0.25, 30);
  }

  public playBlock() {
    // Short metallic high click
    this.playTone(600, 'square', 0.05, 0.08, 200);
  }

  public playSpecial() {
    // Sci-fi rising laser effect
    this.playTone(250, 'square', 0.3, 0.1, 800);
  }

  public playUltimate() {
    // Epic power up noise charging
    this.playTone(120, 'sawtooth', 0.6, 0.25, 1200);
  }

  public playWin() {
    // Victory fanfare!
    const notes = [130, 262, 330, 392, 523];
    const delay = 0.12;
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.soundEnabled) return;
        this.playTone(freq, 'square', 0.3, 0.15);
      }, index * delay * 1000);
    });
  }

  public playDefeat() {
    // Sad defeat tune
    const notes = [330, 294, 262, 196];
    const delay = 0.16;
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.soundEnabled) return;
        this.playTone(freq, 'triangle', 0.4, 0.15);
      }, index * delay * 1000);
    });
  }

  public playSelect() {
    this.playTone(440, 'square', 0.08, 0.08, 550);
  }

  public playBattleStart() {
    this.playTone(440, 'square', 0.18, 0.12);
    setTimeout(() => {
      this.playTone(880, 'square', 0.3, 0.15);
    }, 180);
  }
}

export const audio = new AudioManager();
