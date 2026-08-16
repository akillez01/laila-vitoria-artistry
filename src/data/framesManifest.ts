export interface FramesManifest {
  preset: 'epic' | 'fast';
  count: number;
  prefix: string;
  pad: number;
  ext: string;
  dir: string;
  scrollHeightFramesVh: number;
  scrollHeightStaticVh: number;
  fallbackZoomAmount: number;
}

// count=0 mantém modo estático leve; para habilitar sequência,
// adicione os frames em public/frames e ajuste count.
export const framesManifest: FramesManifest = {
  preset: 'epic',
  count: 0,
  prefix: 'f-',
  pad: 4,
  ext: 'jpg',
  dir: '/frames',
  scrollHeightFramesVh: 620,
  scrollHeightStaticVh: 300,
  fallbackZoomAmount: 0.12,
};
