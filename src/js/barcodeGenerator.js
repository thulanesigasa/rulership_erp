/**
 * Barcode Generator & Complete Bottle Sticker Renderer Utility for Rulership LTD PTY
 */

export function generateBarcodeSVG(code, height = 46) {
  const str = String(code).toUpperCase();
  let barsHtml = '';
  let xOffset = 10;
  
  // Quiet zone
  barsHtml += `<rect x="0" y="0" width="10" height="${height}" fill="white" />`;

  // Start pattern
  const startPattern = [2, 1, 1, 2];
  startPattern.forEach((w, i) => {
    const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
    barsHtml += `<rect x="${xOffset}" y="0" width="${w * 2}" height="${height}" fill="${color}" />`;
    xOffset += w * 2;
  });

  // Character encoding loop
  for (let c = 0; c < str.length; c++) {
    const charCode = str.charCodeAt(c);
    const pattern = [(charCode % 3) + 1, ((charCode * 2) % 3) + 1, (charCode % 2) + 1, 1, 2, 1];
    pattern.forEach((w, i) => {
      const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
      barsHtml += `<rect x="${xOffset}" y="0" width="${w * 1.8}" height="${height - 10}" fill="${color}" />`;
      xOffset += w * 1.8;
    });
  }

  // Stop pattern
  const stopPattern = [2, 3, 3, 1, 1, 1];
  stopPattern.forEach((w, i) => {
    const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
    barsHtml += `<rect x="${xOffset}" y="0" width="${w * 2}" height="${height}" fill="${color}" />`;
    xOffset += w * 2;
  });

  const totalWidth = xOffset + 10;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 18}" class="w-full h-auto max-h-16">
      <rect width="100%" height="100%" fill="#ffffff" />
      ${barsHtml}
      <text x="${totalWidth / 2}" y="${height + 12}" font-family="monospace" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">
        ${str}
      </text>
    </svg>
  `;
}

// Generate COMPLETE standalone sticker card SVG (Header + Barcode + Footer)
export function generateCompleteStickerSVG(sku, barcode, companyName = 'RULERSHIP LTD PTY') {
  const barcodeStr = String(barcode || sku).toUpperCase();
  let barsHtml = '';
  let xOffset = 20;
  const barHeight = 44;

  // Start pattern
  const startPattern = [2, 1, 1, 2];
  startPattern.forEach((w, i) => {
    const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
    barsHtml += `<rect x="${xOffset}" y="45" width="${w * 2}" height="${barHeight}" fill="${color}" />`;
    xOffset += w * 2;
  });

  // Character encoding loop
  for (let c = 0; c < barcodeStr.length; c++) {
    const charCode = barcodeStr.charCodeAt(c);
    const pattern = [(charCode % 3) + 1, ((charCode * 2) % 3) + 1, (charCode % 2) + 1, 1, 2, 1];
    pattern.forEach((w, i) => {
      const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
      barsHtml += `<rect x="${xOffset}" y="45" width="${w * 1.8}" height="${barHeight - 8}" fill="${color}" />`;
      xOffset += w * 1.8;
    });
  }

  // Stop pattern
  const stopPattern = [2, 3, 3, 1, 1, 1];
  stopPattern.forEach((w, i) => {
    const color = i % 2 === 0 ? '#0f172a' : '#ffffff';
    barsHtml += `<rect x="${xOffset}" y="45" width="${w * 2}" height="${barHeight}" fill="${color}" />`;
    xOffset += w * 2;
  });

  const cardWidth = Math.max(300, xOffset + 20);
  const cardHeight = 150;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth * 2}" height="${cardHeight * 2}">
      <!-- Sticker Background Card with Border -->
      <rect x="2" y="2" width="${cardWidth - 4}" height="${cardHeight - 4}" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />

      <!-- Top Header Line & Product SKU Code -->
      <text x="20" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#0058be" letter-spacing="1">
        ${sku}
      </text>
      <line x1="20" y1="38" x2="${cardWidth - 20}" y2="38" stroke="#e2e8f0" stroke-width="1.5" />

      <!-- Middle Vector Barcode -->
      ${barsHtml}
      <text x="${cardWidth / 2}" y="100" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="2">
        ${barcodeStr}
      </text>

      <!-- Bottom Footer Line & Company Name -->
      <line x1="20" y1="114" x2="${cardWidth - 20}" y2="114" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="${cardWidth / 2}" y="132" font-family="sans-serif" font-size="11" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="1">
        ${companyName}
      </text>
    </svg>
  `;
}
