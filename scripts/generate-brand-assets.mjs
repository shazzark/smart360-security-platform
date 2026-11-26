import sharp from "sharp";

const graphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#102436"/>
<circle cx="1080" cy="180" r="260" fill="none" stroke="#526372" stroke-width="1"/>
<circle cx="1080" cy="180" r="200" fill="none" stroke="#e5b85c" stroke-opacity=".3"/>
<path d="M1010 150 1090 182v66c0 53-36 88-80 110-44-22-80-57-80-110v-66Z" fill="#1e3548" stroke="#e5b85c" stroke-width="5"/>
<path d="m977 247 24 24 47-52" fill="none" stroke="#e5b85c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<text x="80" y="110" fill="#f6f7f5" font-family="Arial,sans-serif" font-size="32" font-weight="700" letter-spacing="3">SMART360<tspan fill="#e5b85c">.</tspan></text>
<text x="80" y="168" fill="#e5b85c" font-family="Arial,sans-serif" font-size="17" letter-spacing="4">SECURITY CONSULTANCY</text>
<text x="80" y="310" fill="#f6f7f5" font-family="Arial,sans-serif" font-size="68" font-weight="700" letter-spacing="-2">A clearer view.</text>
<text x="80" y="394" fill="#e5b85c" font-family="Arial,sans-serif" font-size="68" font-weight="700" letter-spacing="-2">A more secure future.</text>
<path d="M80 475h70" stroke="#e5b85c" stroke-width="3"/>
<text x="80" y="530" fill="#c8d2d9" font-family="Arial,sans-serif" font-size="21">CONSULTANCY  /  TRAINING  /  CERTIFICATE VERIFICATION</text>
</svg>`;
await sharp(Buffer.from(graphic)).png().toFile("public/images/smart360-og.png");
console.info("Smart360 Open Graph image generated.");
