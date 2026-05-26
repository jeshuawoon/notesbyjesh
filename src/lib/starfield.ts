type StarFieldOptions = {
  count: number;
  maxDuration?: number;
  maxOpacity?: number;
  maxSize?: number;
  minDuration?: number;
  minOpacity?: number;
  minSize?: number;
  seed: string;
};

export type StarFieldStar = {
  delay: string;
  duration: string;
  id: number;
  left: string;
  opacity: string;
  size: string;
  top: string;
};

export function createStarField({
  count,
  maxDuration = 6,
  maxOpacity = 0.24,
  maxSize = 1.72,
  minDuration = 2.5,
  minOpacity = 0.12,
  minSize = 0.5,
  seed,
}: StarFieldOptions): StarFieldStar[] {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }, (_, id) => ({
    delay: `${round(random() * 4.2, 2)}s`,
    duration: `${round(lerp(minDuration, maxDuration, random()), 2)}s`,
    id,
    left: `${round(random() * 100, 3)}%`,
    opacity: `${round(lerp(minOpacity, maxOpacity, random()), 3)}`,
    size: `${round(lerp(minSize, maxSize, random()), 2)}px`,
    top: `${round(random() * 100, 3)}%`,
  }));
}

function createSeededRandom(seed: string) {
  let value = 0x811c9dc5;

  for (let index = 0; index < seed.length; index++) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(min: number, max: number, progress: number) {
  return min + (max - min) * progress;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
