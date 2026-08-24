# Image Palette Extractor

A browser-based dominant-color extractor that processes image pixels locally with the Canvas API.

## How it works
1. The selected image is drawn to an HTML canvas.
2. Pixel samples are read with `getImageData`.
3. RGB values are quantized into coarse buckets.
4. The most frequent colors are ranked.
5. A distance threshold reduces near-duplicate colors.
6. The final palette is displayed in HEX and RGB.

## Features
- Local image processing
- No uploads
- Dominant-color extraction
- HEX and RGB output
- One-click color copying

## Built with
HTML, CSS, vanilla JavaScript and the Canvas API.

## License
MIT
