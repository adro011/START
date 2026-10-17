import sharp from "sharp";
import path from "node:path";

const files = [
  "public/library/male/PANJABI.jpg",
  "public/library/male/PANJABI-PAjAMA SET.jpg",
  "public/library/male/Shirt.jpg",
  "public/library/male/COAT.jpg",
  "public/library/male/Coaty.webp",
  "public/library/male/JAcket.webp",
  "public/library/photo-album/WEDDING.jpg",
  "public/library/photo-album/EID.jpg",
  "public/library/photo-album/Everyday.jpg",
  "public/library/photo-album/WINTER.jpg",
  "public/library/men.png",
  "public/library/women.png",
  "public/library/children.png",
  "public/hero/men.jpg",
  "public/hero/women.jpg",
  "public/hero/kids.jpg",
];

const TILE = 300;
const LABEL = 30;
const PAD = 8;
const COLS = 4;
const rows = Math.ceil(files.length / COLS);
const W = COLS * (TILE + PAD) + PAD;
const H = rows * (TILE + LABEL + PAD) + PAD;

const composites = [];
for (let i = 0; i < files.length; i += 1) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const left = PAD + col * (TILE + PAD);
  const top = PAD + row * (TILE + LABEL + PAD);

  const meta = await sharp(files[i]).metadata();
  const tile = await sharp(files[i])
    .resize(TILE, TILE, { fit: "contain", background: "#111111" })
    .flatten({ background: "#111111" })
    .png()
    .toBuffer();
  composites.push({ input: tile, left, top });

  const name = path.basename(files[i]).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const label = `<svg width="${TILE}" height="${LABEL}">
    <rect width="100%" height="100%" fill="#000000"/>
    <text x="4" y="13" font-family="Arial" font-size="12" fill="#FFC000">${i + 1}. ${name}</text>
    <text x="4" y="26" font-family="Arial" font-size="11" fill="#969696">${meta.width}x${meta.height} · ${meta.format}</text>
  </svg>`;
  composites.push({ input: Buffer.from(label), left, top: top + TILE });
}

await sharp({ create: { width: W, height: H, channels: 3, background: "#000000" } })
  .composite(composites)
  .png()
  .toFile("C:/Users/catal/AppData/Local/Temp/opencode/imagery-montage.png");

console.log("wrote montage", W, "x", H);
