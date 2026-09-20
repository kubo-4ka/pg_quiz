#!/usr/bin/env node
'use strict';
/*
 * アプリのアイコン（PNG）を生成する: node tools/make-icons.js
 * テーマ色の背景に、データベースを表す円柱とチェックマークを描く。
 * 外部ライブラリを使わず、図形を直接ラスタライズして PNG に書き出す。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'icons');

const BG = [0x33, 0x67, 0x91];
const WHITE = [0xff, 0xff, 0xff];
const TOP = [0xd6, 0xe6, 0xf5];
const BAND = [0xa9, 0xc6, 0xe0];
const CHECK = [0x1d, 0x7f, 0x48];

// 線分までの距離
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** 座標 (x, y)（0〜1）の色を返す。背景の外は null（透明） */
function shade(x, y, { radius, scale }) {
  // 角丸の背景
  if (radius > 0) {
    const cx = Math.min(Math.max(x, radius), 1 - radius);
    const cy = Math.min(Math.max(y, radius), 1 - radius);
    if (Math.hypot(x - cx, y - cy) > radius) return null;
  }
  const k = scale;
  const u = (x - 0.5) / k; // 中心基準・縮尺を戻した座標
  const v = (y - 0.5) / k;

  // チェックマーク（円柱の手前）
  const cw = 0.055;
  const d = Math.min(distSeg(u, v, -0.13, 0.08, -0.03, 0.18), distSeg(u, v, -0.03, 0.18, 0.2, -0.06));
  if (d < cw) return CHECK;

  // 円柱
  const rx = 0.27;
  const ry = 0.08;
  const top = -0.24;
  const bottom = 0.24;
  const inEllipse = (cy) => (u / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
  if (inEllipse(top)) return TOP;
  const inBody = Math.abs(u) <= rx && v >= top && v <= bottom;
  if (inBody || inEllipse(bottom)) {
    // 帯（楕円の下側の弧）
    for (const cy of [-0.08, 0.08]) {
      const e = (u / rx) ** 2 + ((v - cy) / ry) ** 2;
      if (v >= cy && Math.abs(Math.sqrt(e) - 1) < 0.12) return BAND;
    }
    return WHITE;
  }
  return BG;
}

function render(size, opts) {
  const SS = 4; // 1ピクセルあたり 4×4 でサンプリングしてなめらかにする
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let px = 0; px < size; px++) {
      let r = 0; let g = 0; let b = 0; let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, opts);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
        }
      }
      const o = 1 + px * 4;
      if (a) { row[o] = r / a; row[o + 1] = g / a; row[o + 2] = b / a; }
      row[o + 3] = Math.round((a * 255) / (SS * SS));
    }
    rows.push(row);
  }
  return png(size, Buffer.concat(rows));
}

// ---- PNG 書き出し ----
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const x of buf) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // ビット深度
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

fs.mkdirSync(OUT, { recursive: true });
const targets = [
  // 通常のアイコン（角丸・透明な角）
  ['icon-192.png', 192, { radius: 0.2, scale: 1 }],
  ['icon-512.png', 512, { radius: 0.2, scale: 1 }],
  // マスカブル（端末側で切り抜くため全面を塗り、図柄は中央 80% に収める）
  ['icon-maskable-512.png', 512, { radius: 0, scale: 0.8 }],
  // iOS のホーム画面用（端末側で角を丸める）
  ['apple-touch-icon.png', 180, { radius: 0, scale: 0.9 }]
];
for (const [name, size, opts] of targets) {
  const buf = render(size, opts);
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`${name}  ${size}px  ${buf.length} bytes`);
}
