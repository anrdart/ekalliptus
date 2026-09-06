// One-off generator: creates the 9 missing blog topic SVGs, matching the
// existing style (dark bg gradient + purple/pink accent, 1200x630).
import { writeFileSync } from 'fs'

const header = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0c1222;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1a2332;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>`

const files = {
  'biaya-redesign-website-aplikasi.svg': `
  <rect x="420" y="150" width="360" height="260" rx="12" fill="#0f172a" opacity="0.8" stroke="#a855f7" stroke-width="2"/>
  <rect x="420" y="150" width="360" height="36" rx="12" fill="#1e293b"/>
  <circle cx="442" cy="168" r="5" fill="#ef4444" opacity="0.7"/>
  <circle cx="460" cy="168" r="5" fill="#f59e0b" opacity="0.7"/>
  <circle cx="478" cy="168" r="5" fill="#22c55e" opacity="0.7"/>
  <rect x="440" y="205" width="140" height="12" rx="6" fill="#a855f7" opacity="0.7"/>
  <rect x="440" y="230" width="320" height="8" rx="4" fill="#64748b" opacity="0.5"/>
  <rect x="440" y="248" width="280" height="8" rx="4" fill="#64748b" opacity="0.4"/>
  <rect x="440" y="280" width="100" height="70" rx="8" fill="#1e3a5f" opacity="0.6"/>
  <rect x="555" y="280" width="100" height="70" rx="8" fill="#2d1b4e" opacity="0.6"/>
  <rect x="670" y="280" width="90" height="70" rx="8" fill="#1e293b" opacity="0.6"/>
  <path d="M 830 200 A 130 130 0 1 1 830 360" fill="none" stroke="url(#accent)" stroke-width="6" stroke-linecap="round"/>
  <polygon points="820,345 845,365 815,375" fill="#ec4899"/>
</svg>`,

  'perbedaan-wireframe-mockup-prototype.svg': `
  <rect x="150" y="190" width="240" height="250" rx="10" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="8 6"/>
  <rect x="170" y="215" width="200" height="16" rx="4" fill="#64748b" opacity="0.5"/>
  <rect x="170" y="245" width="200" height="8" rx="4" fill="#64748b" opacity="0.3"/>
  <rect x="170" y="265" width="120" height="8" rx="4" fill="#64748b" opacity="0.3"/>
  <rect x="170" y="300" width="90" height="90" rx="6" fill="none" stroke="#64748b" opacity="0.4"/>
  <rect x="275" y="300" width="95" height="90" rx="6" fill="none" stroke="#64748b" opacity="0.4"/>
  <rect x="480" y="190" width="240" height="250" rx="10" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
  <rect x="500" y="215" width="200" height="16" rx="4" fill="url(#accent)" opacity="0.8"/>
  <rect x="500" y="245" width="200" height="8" rx="4" fill="#a855f7" opacity="0.4"/>
  <rect x="500" y="265" width="130" height="8" rx="4" fill="#a855f7" opacity="0.3"/>
  <rect x="500" y="300" width="90" height="90" rx="6" fill="#a855f7" opacity="0.25"/>
  <rect x="605" y="300" width="95" height="90" rx="6" fill="#ec4899" opacity="0.25"/>
  <rect x="810" y="190" width="240" height="250" rx="10" fill="#0f172a" stroke="#ec4899" stroke-width="2"/>
  <circle cx="930" cy="250" r="12" fill="none" stroke="#ec4899" stroke-width="3"/>
  <path d="M 926 246 L 937 252 L 926 258 Z" fill="#ec4899"/>
  <rect x="830" y="290" width="120" height="14" rx="7" fill="url(#accent)" opacity="0.9"/>
  <rect x="830" y="320" width="90" height="14" rx="7" fill="#1e293b" stroke="#ec4899" opacity="0.7"/>
  <path d="M 850 380 Q 900 400 950 380" stroke="#ec4899" stroke-width="2" fill="none" stroke-dasharray="5 5"/>
</svg>`,

  'panduan-hosting-domain.svg': `
  <circle cx="480" cy="315" r="110" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.8"/>
  <ellipse cx="480" cy="315" rx="110" ry="42" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.4"/>
  <ellipse cx="480" cy="315" rx="42" ry="110" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.4"/>
  <line x1="370" y1="315" x2="590" y2="315" stroke="#3b82f6" stroke-width="1.5" opacity="0.4"/>
  <text x="480" y="322" text-anchor="middle" font-family="monospace" font-size="30" fill="#ec4899" font-weight="bold">.com</text>
  <rect x="700" y="210" width="280" height="60" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
  <circle cx="725" cy="240" r="6" fill="#22c55e" opacity="0.8"/>
  <rect x="745" y="232" width="150" height="8" rx="4" fill="#a855f7" opacity="0.6"/>
  <rect x="745" y="248" width="100" height="6" rx="3" fill="#64748b" opacity="0.5"/>
  <rect x="700" y="290" width="280" height="60" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
  <circle cx="725" cy="320" r="6" fill="#22c55e" opacity="0.8"/>
  <rect x="745" y="312" width="130" height="8" rx="4" fill="#a855f7" opacity="0.6"/>
  <rect x="745" y="328" width="110" height="6" rx="3" fill="#64748b" opacity="0.5"/>
  <rect x="700" y="370" width="280" height="60" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
  <circle cx="725" cy="400" r="6" fill="#22c55e" opacity="0.8"/>
  <rect x="745" y="392" width="140" height="8" rx="4" fill="#a855f7" opacity="0.6"/>
  <rect x="745" y="408" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
</svg>`,

  'digital-marketing-umkm.svg': `
  <polyline points="180,420 320,360 460,390 600,290 740,320 880,220 1020,240" fill="none" stroke="url(#accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="180,420 320,360 460,390 600,290 740,320 880,220 1020,240 1020,470 180,470" fill="url(#accent)" opacity="0.08"/>
  <circle cx="600" cy="290" r="8" fill="#ec4899"/>
  <circle cx="880" cy="220" r="8" fill="#ec4899"/>
  <path d="M 950 380 L 1010 350 L 1010 410 Z" fill="#a855f7" opacity="0.9"/>
  <path d="M 940 380 Q 920 365 905 380 Q 920 395 940 380" fill="#a855f7" opacity="0.7"/>
  <line x1="1010" y1="350" x2="1035" y2="330" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
  <line x1="1010" y1="380" x2="1040" y2="375" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
  <line x1="1010" y1="410" x2="1035" y2="430" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
</svg>`,

  'tren-desain-website-2026.svg': `
  <rect x="330" y="130" width="360" height="240" rx="14" fill="#1e293b" opacity="0.5" transform="rotate(-6 510 250)"/>
  <rect x="360" y="150" width="360" height="240" rx="14" fill="#1e293b" opacity="0.75" transform="rotate(-2 540 270)"/>
  <rect x="395" y="170" width="360" height="240" rx="14" fill="#0f172a" stroke="url(#accent)" stroke-width="2.5"/>
  <circle cx="725" cy="195" r="10" fill="#a855f7" opacity="0.7"/>
  <rect x="425" y="200" width="160" height="14" rx="7" fill="url(#accent)"/>
  <rect x="425" y="228" width="290" height="8" rx="4" fill="#64748b" opacity="0.5"/>
  <rect x="425" y="248" width="240" height="8" rx="4" fill="#64748b" opacity="0.4"/>
  <rect x="425" y="290" width="120" height="90" rx="8" fill="#a855f7" opacity="0.2"/>
  <rect x="560" y="290" width="120" height="90" rx="8" fill="#ec4899" opacity="0.2"/>
  <circle cx="485" cy="335" r="24" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.7"/>
  <circle cx="620" cy="335" r="24" fill="none" stroke="#ec4899" stroke-width="3" opacity="0.7"/>
  <rect x="810" y="230" width="90" height="170" rx="12" fill="none" stroke="#a855f7" stroke-width="2" opacity="0.6"/>
  <rect x="822" y="250" width="66" height="8" rx="4" fill="#a855f7" opacity="0.6"/>
  <rect x="822" y="270" width="50" height="8" rx="4" fill="#64748b" opacity="0.4"/>
</svg>`,

  'progressive-web-app.svg': `
  <rect x="480" y="110" width="240" height="410" rx="28" fill="#0f172a" stroke="#a855f7" stroke-width="2.5"/>
  <circle cx="600" cy="128" r="7" fill="#334155"/>
  <rect x="500" y="150" width="200" height="60" rx="8" fill="url(#accent)" opacity="0.85"/>
  <text x="600" y="187" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">PWA</text>
  <rect x="500" y="225" width="95" height="70" rx="8" fill="#1e3a5f" opacity="0.7"/>
  <rect x="605" y="225" width="95" height="70" rx="8" fill="#2d1b4e" opacity="0.7"/>
  <rect x="500" y="310" width="200" height="10" rx="5" fill="#a855f7" opacity="0.5"/>
  <rect x="500" y="332" width="150" height="10" rx="5" fill="#64748b" opacity="0.4"/>
  <rect x="500" y="360" width="170" height="10" rx="5" fill="#64748b" opacity="0.35"/>
  <rect x="500" y="415" width="200" height="44" rx="22" fill="#a855f7" opacity="0.9"/>
  <text x="600" y="443" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" fill="#ffffff">Install</text>
  <path d="M 760 180 A 90 90 0 1 1 760 350" fill="none" stroke="#ec4899" stroke-width="4" stroke-dasharray="10 8" opacity="0.8"/>
  <polygon points="752,335 775,355 745,362" fill="#ec4899" opacity="0.9"/>
</svg>`,

  'website-statis-dinamis.svg': `
  <line x1="600" y1="140" x2="600" y2="490" stroke="#334155" stroke-width="2" stroke-dasharray="8 8"/>
  <rect x="180" y="230" width="320" height="170" rx="12" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
  <text x="340" y="270" text-anchor="middle" font-family="monospace" font-size="20" fill="#3b82f6" font-weight="bold">STATIS</text>
  <rect x="210" y="295" width="260" height="8" rx="4" fill="#3b82f6" opacity="0.4"/>
  <rect x="210" y="315" width="200" height="8" rx="4" fill="#3b82f6" opacity="0.3"/>
  <rect x="210" y="335" width="230" height="8" rx="4" fill="#3b82f6" opacity="0.3"/>
  <rect x="700" y="230" width="320" height="170" rx="12" fill="#0f172a" stroke="#ec4899" stroke-width="2"/>
  <text x="860" y="270" text-anchor="middle" font-family="monospace" font-size="20" fill="#ec4899" font-weight="bold">DINAMIS</text>
  <rect x="730" y="295" width="260" height="8" rx="4" fill="#ec4899" opacity="0.5"/>
  <circle cx="745" cy="330" r="7" fill="#ec4899" opacity="0.7"/>
  <rect x="760" y="324" width="180" height="8" rx="4" fill="#ec4899" opacity="0.35"/>
  <circle cx="745" cy="355" r="7" fill="#ec4899" opacity="0.7"/>
  <rect x="760" y="349" width="150" height="8" rx="4" fill="#ec4899" opacity="0.35"/>
  <circle cx="745" cy="380" r="7" fill="#ec4899" opacity="0.7"/>
  <rect x="760" y="374" width="200" height="8" rx="4" fill="#ec4899" opacity="0.35"/>
</svg>`,

  'keamanan-website.svg': `
  <path d="M 600 130 L 720 175 L 720 300 Q 720 420 600 490 Q 480 420 480 300 L 480 175 Z" fill="#0f172a" stroke="url(#accent)" stroke-width="3"/>
  <rect x="558" y="280" width="84" height="70" rx="10" fill="#a855f7" opacity="0.85"/>
  <path d="M 575 280 L 575 255 Q 575 230 600 230 Q 625 230 625 255 L 625 280" fill="none" stroke="#ec4899" stroke-width="8" stroke-linecap="round"/>
  <circle cx="600" cy="308" r="9" fill="#0f172a"/>
  <rect x="596" y="312" width="8" height="20" rx="4" fill="#0f172a"/>
  <path d="M 380 220 L 420 220 M 380 250 L 410 250 M 380 280 L 425 280" stroke="#ef4444" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
  <path d="M 780 220 L 820 220 M 790 250 L 820 250 M 785 280 L 825 280" stroke="#22c55e" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
</svg>`,

  'kecepatan-website.svg': `
  <path d="M 380 400 A 220 220 0 0 1 820 400" fill="none" stroke="#1e293b" stroke-width="24" stroke-linecap="round"/>
  <path d="M 380 400 A 220 220 0 0 1 560 195" fill="none" stroke="#ef4444" stroke-width="24" stroke-linecap="round" opacity="0.8"/>
  <path d="M 560 195 A 220 220 0 0 1 740 250" fill="none" stroke="#f59e0b" stroke-width="24" stroke-linecap="round" opacity="0.8"/>
  <path d="M 740 250 A 220 220 0 0 1 820 400" fill="none" stroke="#22c55e" stroke-width="24" stroke-linecap="round" opacity="0.8"/>
  <line x1="600" y1="400" x2="705" y2="290" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
  <circle cx="600" cy="400" r="14" fill="#ec4899"/>
  <text x="600" y="480" text-anchor="middle" font-family="monospace" font-size="34" fill="#a855f7" font-weight="bold">98/100</text>
</svg>`
}

const outDir = 'apps/web/public/blog'
for (const [name, body] of Object.entries(files)) {
  writeFileSync(`${outDir}/${name}`, header + body)
  console.log('created', name)
}
