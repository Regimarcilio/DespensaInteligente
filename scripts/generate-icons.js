import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, getPixel) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Standard
  ihdr[12] = 0; // Interlace: None

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type);
    const len = data.length;
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(len, 0);

    const crcBuf = Buffer.alloc(4);
    let crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 table
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(buf) {
  const table = getCrcTable();
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

// Despensa Brand Icon Painter
function paintDespensaIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background rounded squircle / base: Deep Teal #0B6E5F
  let r = 11, g = 110, b = 95, a = 255;

  // Outer gradient lighting
  const grad = (1 - (ny * 0.5 + 0.5)) * 0.3;
  r = Math.min(255, Math.floor(r + grad * 40));
  g = Math.min(255, Math.floor(g + grad * 50));
  b = Math.min(255, Math.floor(b + grad * 45));

  // Central isometric cube / emblem
  if (dist < 0.62) {
    // Top facet
    if (ny < -0.05 && Math.abs(nx) < 0.45 && (ny + Math.abs(nx) * 0.6) < 0.2) {
      r = 230; g = 250; b = 245;
    }
    // Left facet
    else if (nx < 0 && Math.abs(nx) < 0.45 && ny < 0.48) {
      r = 8; g = 80; b = 70;
    }
    // Right facet
    else if (nx >= 0 && Math.abs(nx) < 0.45 && ny < 0.48) {
      r = 14; g = 140; b = 120;
    }
  }

  // Freshness leaf in center
  const leafDist = Math.sqrt((nx * 1.2) * (nx * 1.2) + ((ny - 0.05) * 1.2) * ((ny - 0.05) * 1.2));
  if (leafDist < 0.28) {
    r = 110; g = 231; b = 183; // Mint
  }

  // Golden citrus spark on upper right
  const sparkDist = Math.sqrt((nx - 0.22) * (nx - 0.22) + (ny + 0.2) * (ny + 0.2));
  if (sparkDist < 0.14) {
    r = 255; g = 178; b = 36; // Amber
  }

  return [r, g, b, a];
}

// Ensure public directory exists
if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

fs.writeFileSync('/public/pwa-192x192.png', createPng(192, 192, paintDespensaIcon));
fs.writeFileSync('/public/pwa-512x512.png', createPng(512, 512, paintDespensaIcon));
fs.writeFileSync('/public/pwa-maskable-512x512.png', createPng(512, 512, paintDespensaIcon));
fs.writeFileSync('/public/apple-touch-icon.png', createPng(180, 180, paintDespensaIcon));

console.log('PWA PNG icons generated successfully!');
