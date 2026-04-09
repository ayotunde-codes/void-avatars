import { cssHsl } from './chunk-TTNWV7EZ.js';
import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/emoticon.ts
function renderEmoticon(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":em", 30);
  const h = size / 2;
  const faceType = Math.floor(r[0] * 3);
  const faceRad = size * 0.41;
  const faceFs = cssHsl(palette.colors[1]);
  let faceEl;
  if (faceType === 0) {
    faceEl = `<circle cx="${h}" cy="${h}" r="${faceRad}" fill="${faceFs}"/>`;
  } else if (faceType === 1) {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180);
      return `${(h + faceRad * Math.cos(a)).toFixed(2)},${(h + faceRad * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    faceEl = `<polygon points="${pts}" fill="${faceFs}"/>`;
  } else {
    faceEl = `<rect x="${h - faceRad}" y="${h - faceRad}" width="${faceRad * 2}" height="${faceRad * 2}" rx="${faceRad * 0.38}" fill="${faceFs}"/>`;
  }
  const eyeStyle = Math.floor(r[1] * 4);
  const eyeY = h - size * 0.09;
  const eyeSpread = size * 0.14, eyeR = size * 0.065;
  const eyeFs = cssHsl(palette.focal);
  const eyeSW = size * 0.026;
  let eyesEl;
  switch (eyeStyle) {
    case 0:
      eyesEl = `<circle cx="${h - eyeSpread}" cy="${eyeY}" r="${eyeR}" fill="${eyeFs}"/><circle cx="${h + eyeSpread}" cy="${eyeY}" r="${eyeR}" fill="${eyeFs}"/>`;
      break;
    case 1:
      eyesEl = `<path d="M ${h - eyeSpread - eyeR} ${eyeY} A ${eyeR} ${eyeR} 0 0 1 ${h - eyeSpread + eyeR} ${eyeY} Z" fill="${eyeFs}"/><path d="M ${h + eyeSpread - eyeR} ${eyeY} A ${eyeR} ${eyeR} 0 0 1 ${h + eyeSpread + eyeR} ${eyeY} Z" fill="${eyeFs}"/>`;
      break;
    case 2:
      eyesEl = `<line x1="${h - eyeSpread - eyeR}" y1="${eyeY}" x2="${h - eyeSpread + eyeR}" y2="${eyeY}" stroke="${eyeFs}" stroke-width="${eyeSW}" stroke-linecap="round"/><line x1="${h + eyeSpread - eyeR}" y1="${eyeY}" x2="${h + eyeSpread + eyeR}" y2="${eyeY}" stroke="${eyeFs}" stroke-width="${eyeSW}" stroke-linecap="round"/>`;
      break;
    default:
      eyesEl = `<ellipse cx="${h - eyeSpread}" cy="${eyeY}" rx="${eyeR * 1.3}" ry="${eyeR * 0.7}" fill="${eyeFs}"/><ellipse cx="${h + eyeSpread}" cy="${eyeY}" rx="${eyeR * 1.3}" ry="${eyeR * 0.7}" fill="${eyeFs}"/>`;
      break;
  }
  const mouthY = h + size * 0.11;
  const mouthW = size * 0.2;
  const mouthSW = size * 0.03;
  const mouthStroke = cssHsl(palette.colors[3]);
  const smileD = `M ${h - mouthW} ${mouthY} Q ${h} ${(mouthY + mouthW * 0.65).toFixed(2)} ${h + mouthW} ${mouthY}`;
  const body = `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Face -->
  <g id="va-${uid}-face">
    ${faceEl}
    <g id="va-${uid}-eyes">${eyesEl}</g>
    <g id="va-${uid}-mouth">
      <path id="va-${uid}-mouth-path"
        d="${smileD}"
        fill="none"
        stroke="${mouthStroke}"
        stroke-width="${mouthSW}"
        stroke-linecap="round"/>
    </g>
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.5"/>`;
  return { extraDefs: "", body };
}

export { renderEmoticon };
//# sourceMappingURL=chunk-HM5F6EEI.js.map
//# sourceMappingURL=chunk-HM5F6EEI.js.map