import React from 'react';

export type CamoPatternType = 'soldier' | 'woodland' | 'digital' | 'desert';
export type CamoIntensity = 'subtle' | 'medium' | 'bold';

interface MilitaryCamoBackgroundProps {
  pattern?: CamoPatternType;
  intensity?: CamoIntensity;
  showSoldier?: boolean;
}

export const MilitaryCamoBackground: React.FC<MilitaryCamoBackgroundProps> = ({
  pattern = 'soldier',
  intensity = 'medium',
  showSoldier = true,
}) => {
  // Determine opacity values based on intensity
  const opacityConfig = {
    subtle: {
      camo: 0.35,
      soldier: 0.18,
      grid: 0.12,
      vignette: 0.75,
    },
    medium: {
      camo: 0.55,
      soldier: 0.28,
      grid: 0.18,
      vignette: 0.82,
    },
    bold: {
      camo: 0.75,
      soldier: 0.40,
      grid: 0.25,
      vignette: 0.88,
    },
  }[intensity];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base military deep dark tactical background */}
      <div className="absolute inset-0 bg-[#0d120e]" />

      {/* SVG Patterns for authentic military camouflage */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* 1. Classic Organic Woodland Camouflage Pattern (مرقط كلاسيكي) */}
          <pattern
            id="woodland-camo"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            {/* Background tone */}
            <rect width="240" height="240" fill="#141a13" />

            {/* Layer 1: Dark olive blotches */}
            <path
              d="M0,40 Q30,10 70,30 T130,20 Q170,40 180,80 T140,140 Q90,160 50,130 T0,110 Z
                 M160,180 Q190,150 220,170 T240,210 Q220,240 180,240 T150,200 Z"
              fill="#222d1e"
            />

            {/* Layer 2: Medium foliage army green blotches */}
            <path
              d="M60,0 Q90,30 120,10 T180,30 Q200,60 170,90 T110,100 Q70,90 60,60 Z
                 M20,170 Q40,140 80,150 T120,200 Q100,230 60,230 T10,210 Z
                 M200,80 Q230,70 240,100 T210,130 Q190,120 190,90 Z"
              fill="#2f3e29"
            />

            {/* Layer 3: Khaki / Coyote blotches */}
            <path
              d="M10,70 Q40,60 50,90 T20,120 Q0,110 5,80 Z
                 M130,70 Q160,60 170,90 T140,120 Q120,110 120,80 Z
                 M80,180 Q110,160 130,180 T110,220 Q80,220 70,200 Z
                 M180,10 Q210,0 230,20 T210,50 Q180,40 180,20 Z"
              fill="#3e3928"
            />

            {/* Layer 4: Deep black / charcoal tactical blotches */}
            <path
              d="M30,30 Q60,20 70,50 T40,80 Q10,70 20,40 Z
                 M150,130 Q180,120 190,150 T160,180 Q130,170 140,140 Z
                 M90,100 Q120,90 130,120 T100,150 Q70,140 80,110 Z
                 M210,190 Q240,180 240,210 T210,240 Q190,230 190,200 Z"
              fill="#0b0e0a"
            />

            {/* Layer 5: Accent mottled speckles */}
            <circle cx="45" cy="160" r="12" fill="#222d1e" />
            <circle cx="160" cy="40" r="14" fill="#3e3928" />
            <circle cx="215" cy="150" r="10" fill="#0b0e0a" />
            <circle cx="95" cy="65" r="8" fill="#2f3e29" />
          </pattern>

          {/* 2. Tactical Digital Pixel Camo Pattern (مرقط رقمي) */}
          <pattern
            id="digital-camo"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <rect width="120" height="120" fill="#151b14" />

            {/* Dark olive pixels */}
            <rect x="0" y="0" width="20" height="20" fill="#243120" />
            <rect x="20" y="0" width="10" height="10" fill="#243120" />
            <rect x="50" y="10" width="20" height="20" fill="#243120" />
            <rect x="80" y="30" width="30" height="20" fill="#243120" />
            <rect x="10" y="60" width="30" height="20" fill="#243120" />
            <rect x="70" y="80" width="20" height="30" fill="#243120" />

            {/* Mid green pixels */}
            <rect x="30" y="20" width="20" height="20" fill="#32442b" />
            <rect x="70" y="0" width="30" height="20" fill="#32442b" />
            <rect x="10" y="40" width="20" height="20" fill="#32442b" />
            <rect x="50" y="50" width="20" height="30" fill="#32442b" />
            <rect x="90" y="70" width="20" height="20" fill="#32442b" />
            <rect x="30" y="90" width="30" height="20" fill="#32442b" />

            {/* Sand / Coyote pixels */}
            <rect x="20" y="10" width="10" height="10" fill="#443c2a" />
            <rect x="60" y="30" width="20" height="10" fill="#443c2a" />
            <rect x="0" y="80" width="20" height="20" fill="#443c2a" />
            <rect x="40" y="70" width="10" height="20" fill="#443c2a" />
            <rect x="100" y="20" width="20" height="20" fill="#443c2a" />

            {/* Charcoal black pixels */}
            <rect x="40" y="0" width="10" height="20" fill="#0c100b" />
            <rect x="70" y="20" width="10" height="10" fill="#0c100b" />
            <rect x="30" y="50" width="20" height="10" fill="#0c100b" />
            <rect x="80" y="60" width="10" height="20" fill="#0c100b" />
            <rect x="60" y="100" width="20" height="20" fill="#0c100b" />
          </pattern>

          {/* 3. Desert Mottled Camo Pattern (مرقط صحراوي) */}
          <pattern
            id="desert-camo"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="#24211a" />
            <path
              d="M10,20 Q40,0 80,30 T130,10 Q160,40 140,80 T80,90 Q40,100 20,70 Z
                 M120,120 Q160,100 180,140 T150,190 Q110,200 90,160 Z"
              fill="#423b2c"
            />
            <path
              d="M30,110 Q70,90 90,120 T60,170 Q20,180 10,140 Z
                 M140,20 Q180,10 190,40 T160,80 Q130,70 130,40 Z"
              fill="#524a37"
            />
            <path
              d="M60,40 Q80,30 90,50 T70,70 Q50,65 55,45 Z
                 M160,140 Q180,130 190,150 T170,170 Q150,165 155,145 Z"
              fill="#181510"
            />
          </pattern>

          {/* Tactical grid pattern */}
          <pattern
            id="tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#4ade80"
              strokeWidth="0.5"
              strokeOpacity="0.25"
            />
            <circle cx="0" cy="0" r="1.5" fill="#4ade80" fillOpacity="0.4" />
          </pattern>
        </defs>
      </svg>

      {/* Camouflage Layer (مرقط) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage:
            pattern === 'digital'
              ? 'url(#digital-camo)'
              : pattern === 'desert'
              ? 'url(#desert-camo)'
              : 'url(#woodland-camo)',
          opacity: opacityConfig.camo,
        }}
      >
        <svg className="w-full h-full">
          <rect
            width="100%"
            height="100%"
            fill={
              pattern === 'digital'
                ? 'url(#digital-camo)'
                : pattern === 'desert'
                ? 'url(#desert-camo)'
                : 'url(#woodland-camo)'
            }
          />
        </svg>
      </div>

      {/* Tactical HUD Grid Overlay */}
      <div
        className="absolute inset-0"
        style={{ opacity: opacityConfig.grid }}
      >
        <svg className="w-full h-full">
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
        </svg>
      </div>

      {/* Military Soldier Illustration & Insignia Watermark (جندي بالعتاد والتجهيز العسكري) */}
      {showSoldier && (
        <div
          className="absolute right-0 top-0 bottom-0 w-full max-w-2xl pointer-events-none flex items-center justify-end pr-4 md:pr-12 transition-opacity duration-700"
          style={{ opacity: opacityConfig.soldier }}
        >
          <svg
            viewBox="0 0 600 800"
            className="w-full h-full max-h-[92vh] object-contain drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Tactical Crosshair / Radar Circle in background */}
            <g stroke="#86efac" strokeWidth="1" strokeDasharray="6 4" opacity="0.45">
              <circle cx="340" cy="380" r="260" />
              <circle cx="340" cy="380" r="190" />
              <circle cx="340" cy="380" r="100" />
              <line x1="340" y1="80" x2="340" y2="680" />
              <line x1="40" y1="380" x2="640" y2="380" />
            </g>

            {/* Corner Coordinates & Tactical Military Stamps */}
            <g fill="#86efac" opacity="0.6" className="font-mono text-[11px]">
              <text x="360" y="140">COORD: 33°19'29"N 44°25'04"E</text>
              <text x="360" y="160">SYS: MIL-SEC-V5 // READY</text>
              <text x="360" y="180">ZONE: TACTICAL CAMO GRID</text>
              <text x="360" y="600" textAnchor="end">DEFENSE RECORD MGMT</text>
            </g>

            {/* Tactical Combat Soldier Silhouette & Silhouette Details */}
            <g fill="#2e3d2a" stroke="#4d6346" strokeWidth="2">
              {/* Combat Helmet with NVG Mount and Goggles */}
              {/* Helmet Dome */}
              <path
                d="M260,210 C260,140 330,130 380,140 C430,150 450,190 450,225 C450,245 440,260 415,265 C390,270 290,265 270,255 C260,250 260,230 260,210 Z"
                fill="#273523"
              />
              {/* Helmet Rim and NVG Mount */}
              <path d="M265,225 L445,235 L440,248 L270,240 Z" fill="#1b2518" />
              <rect x="345" y="150" width="26" height="32" rx="3" fill="#131a11" />
              <circle cx="358" cy="166" r="6" fill="#4d6346" />

              {/* Tactical Goggles strapped to Helmet */}
              <path
                d="M285,215 C295,195 410,205 425,220 C420,235 390,242 355,240 C320,238 290,230 285,215 Z"
                fill="#161e15"
                stroke="#86efac"
                strokeWidth="1.5"
                strokeOpacity="0.7"
              />
              {/* Goggle Lens reflections */}
              <ellipse cx="320" cy="225" rx="22" ry="9" fill="#2d422a" opacity="0.8" />
              <ellipse cx="385" cy="228" rx="22" ry="9" fill="#2d422a" opacity="0.8" />

              {/* Head / Tactical Balaclava & Face Mask */}
              <path
                d="M280,240 C280,240 270,290 285,320 C300,350 340,365 375,360 C410,355 425,325 430,295 C435,265 425,240 425,240 Z"
                fill="#1f2a1c"
              />
              {/* Eyes slit / Balaclava opening */}
              <path
                d="M305,255 C320,250 380,252 395,258 C390,268 375,272 350,272 C325,272 310,266 305,255 Z"
                fill="#121811"
              />

              {/* Tactical Headset / Ear Protection */}
              <rect x="260" y="240" width="18" height="34" rx="6" fill="#141a12" stroke="#4d6346" />
              <path d="M260,260 L245,290" stroke="#141a12" strokeWidth="4" />

              {/* Tactical Neck / Shemagh / Collar */}
              <path
                d="M275,330 C275,330 240,370 230,410 C220,450 240,470 260,475 L450,475 C470,470 480,440 470,405 C460,370 430,330 430,330 Z"
                fill="#2b3b27"
              />

              {/* Tactical Body Armor Vest / Plate Carrier (درع تكتيكي بجيوب عسكرية) */}
              <path
                d="M220,440 C200,480 185,550 180,680 L520,680 C515,550 500,480 480,440 L430,410 L270,410 Z"
                fill="#233020"
                stroke="#3e5238"
                strokeWidth="2.5"
              />

              {/* MOLLE Webbing Strips on Vest (أشرطة العتاد العسكري) */}
              <line x1="230" y1="490" x2="470" y2="490" stroke="#161f14" strokeWidth="5" />
              <line x1="225" y1="525" x2="475" y2="525" stroke="#161f14" strokeWidth="5" />
              <line x1="220" y1="560" x2="480" y2="560" stroke="#161f14" strokeWidth="5" />
              <line x1="215" y1="595" x2="485" y2="595" stroke="#161f14" strokeWidth="5" />
              <line x1="210" y1="630" x2="490" y2="630" stroke="#161f14" strokeWidth="5" />

              {/* Tactical Ammo Pouches (جيوب مخازن العتاد) */}
              <rect x="250" y="525" width="45" height="70" rx="4" fill="#1b2518" stroke="#364930" />
              <rect x="305" y="525" width="45" height="70" rx="4" fill="#1b2518" stroke="#364930" />
              <rect x="360" y="525" width="45" height="70" rx="4" fill="#1b2518" stroke="#364930" />
              <rect x="415" y="525" width="45" height="70" rx="4" fill="#1b2518" stroke="#364930" />

              {/* Military Rank / Eagle Emblem Patch on Shoulder/Chest */}
              <rect x="315" y="445" width="70" height="35" rx="5" fill="#151d13" stroke="#86efac" strokeWidth="1" />
              {/* Emblem Eagle Wings / Swords */}
              <path
                d="M330,465 L350,453 L370,465 L350,460 Z"
                fill="#86efac"
                opacity="0.8"
              />
              <circle cx="350" cy="465" r="3" fill="#86efac" />

              {/* Shoulder Pauldrons & Camo Sleeves */}
              <path
                d="M220,440 C190,470 160,540 140,650 L180,680 C190,580 210,500 230,460 Z"
                fill="#2c3a27"
              />
              <path
                d="M480,440 C510,470 540,540 560,650 L520,680 C510,580 490,500 470,460 Z"
                fill="#2c3a27"
              />

              {/* Radio Antenna */}
              <line x1="250" y1="420" x2="240" y2="280" stroke="#131911" strokeWidth="4" />
              <circle cx="240" cy="278" r="4" fill="#4d6346" />
            </g>

            {/* Tactical Heading Banner */}
            <g transform="translate(180, 720)">
              <rect x="0" y="0" width="340" height="36" rx="6" fill="#111710" stroke="#4d6346" strokeWidth="1" />
              <text
                x="170"
                y="23"
                textAnchor="middle"
                fill="#86efac"
                fontSize="13"
                fontWeight="bold"
                letterSpacing="2"
              >
                ★ القوات المسلحة — منظومة الإدارة العسكرية ★
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* Dark Vignette Overlay so UI components pop with high contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(13, 18, 14, 0.4) 0%, rgba(10, 14, 11, 0.85) 60%, rgba(7, 10, 8, 0.98) 100%)',
        }}
      />

      {/* Ambient Military Camo Glow (subtle olive and tactical emerald) */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/15 blur-3xl pointer-events-none"
      />
      <div
        className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#3b4d32]/20 blur-3xl pointer-events-none"
      />
    </div>
  );
};
