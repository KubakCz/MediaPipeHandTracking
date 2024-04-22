/**
 * Represents a resolution in pixels.
 */
export class Resolution {
  width: number;
  height: number;
  ratio: string;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ratio = this.calculateRatio(width, height);
  }

  private calculateRatio(width: number, height: number): string {
    const gcd = this.greatestCommonDivisor(width, height);
    return `${width / gcd}:${height / gcd}`;
  }

  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }

  toString(): string {
    return `${this.width}x${this.height} (${this.ratio})`;
  }
}

export const RESOLUTIONS = [
  new Resolution(3840, 2160), // 2160p (4K UHD) 16:9
  new Resolution(2560, 1440), // 1440p (2K) 16:9
  new Resolution(1920, 1080), // 1080p 16:9
  new Resolution(1600, 900), // 900p 16:9
  new Resolution(1280, 720), // 720p 16:9
  new Resolution(640, 360), // 360p 16:9
  new Resolution(1280, 960), // 960p 4:3
  new Resolution(800, 600), // 600p 4:3
  new Resolution(640, 480), // 480p 4:3
  new Resolution(320, 240), // 240p 4:3
];
