Pasta de frames da abertura cinematografica.

Padrao esperado:
- f-0001.jpg
- f-0002.jpg
- f-0003.jpg
...

Configuracao no manifesto:
- Arquivo: src/data/framesManifest.ts
- count: quantidade total de frames existentes
- prefix: f-
- pad: 4
- ext: jpg
- dir: /frames

Ritmo da abertura:
- preset: epic (mais longo) ou fast (mais curto)
- scrollHeightFramesVh: altura com frames (sugestao 620 para epic, 420 para fast)
- scrollHeightStaticVh: altura sem frames (sugestao 300 para epic, 220 para fast)
- fallbackZoomAmount: zoom do modo estatico (0.12 epic, 0.07 fast)
