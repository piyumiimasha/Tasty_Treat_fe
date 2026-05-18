"use client"

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes sp1 {
          0%, 100% { transform: translate(0,0) rotate(0deg); opacity: 0.55; }
          40% { transform: translate(10px,-20px) rotate(135deg); opacity: 1; }
          70% { transform: translate(-6px,-10px) rotate(270deg); opacity: 0.7; }
        }
        @keyframes sp2 {
          0%, 100% { transform: translate(0,0) scale(0.8); opacity: 0.4; }
          50% { transform: translate(-12px,-22px) scale(1.4); opacity: 1; }
        }
        @keyframes sp3 {
          0%, 100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 0.6; }
          33% { transform: translate(7px,-15px) rotate(120deg) scale(1.2); opacity: 0.9; }
          66% { transform: translate(-8px,-8px) rotate(240deg) scale(0.85); opacity: 0.7; }
        }
        @keyframes flicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          20%  { transform: scaleY(1.2) scaleX(0.8);  opacity: 1;    }
          50%  { transform: scaleY(0.88) scaleX(1.12); opacity: 0.82; }
          80%  { transform: scaleY(1.1) scaleX(0.88); opacity: 0.95; }
        }
      `}</style>

      <svg
        viewBox="0 0 420 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
        aria-label="Baker woman presenting a tiered cake"
      >
        {/* Ambient background blob */}
        <ellipse cx="210" cy="340" rx="195" ry="245" fill="#FDF0E8" opacity="0.6" />
        <ellipse cx="210" cy="340" rx="158" ry="200" fill="#FBE8DC" opacity="0.28" />

        {/* ── Sparkles (independent of main float) ── */}
        <g style={{ transformOrigin: '46px 148px', animation: 'sp1 4.2s ease-in-out infinite' }}>
          <path d="M46 138 L48.5 146 L57 146 L50.5 151 L53 159 L46 155 L39 159 L41.5 151 L35 146 L43.5 146 Z" fill="#C97B96" opacity="0.72" />
        </g>
        <g style={{ transformOrigin: '372px 108px', animation: 'sp2 5.5s ease-in-out infinite 0.9s' }}>
          <path d="M372 99 L374 106 L381 106 L376 111 L378 118 L372 114 L366 118 L368 111 L363 106 L370 106 Z" fill="#A0526E" opacity="0.7" />
        </g>
        <g style={{ transformOrigin: '390px 250px', animation: 'sp3 3.9s ease-in-out infinite 0.4s' }}>
          <circle cx="390" cy="250" r="5.5" fill="#C97B96" opacity="0.58" />
          <circle cx="390" cy="250" r="2.5" fill="white" opacity="0.9" />
        </g>
        <g style={{ transformOrigin: '22px 295px', animation: 'sp1 6.1s ease-in-out infinite 1.6s' }}>
          <path d="M22 286 L24 293 L31 293 L26 298 L28 305 L22 301 L16 305 L18 298 L13 293 L20 293 Z" fill="#A0526E" opacity="0.58" />
        </g>
        <g style={{ transformOrigin: '388px 378px', animation: 'sp2 4.3s ease-in-out infinite 2.1s' }}>
          <path d="M388 370 L390 376 L396 376 L391 381 L393 387 L388 383 L383 387 L385 381 L380 376 L386 376 Z" fill="#C97B96" opacity="0.52" />
        </g>
        <g style={{ transformOrigin: '32px 430px', animation: 'sp3 5.1s ease-in-out infinite 0.7s' }}>
          <circle cx="32" cy="430" r="6" fill="#D98FAC" opacity="0.48" />
          <circle cx="32" cy="430" r="2.5" fill="white" opacity="0.8" />
        </g>
        <circle cx="100" cy="178" r="3.5" fill="#C97B96" opacity="0.4"
          style={{ transformOrigin: '100px 178px', animation: 'sp2 3.6s ease-in-out infinite 1.1s' }} />
        <circle cx="322" cy="468" r="3" fill="#A0526E" opacity="0.48"
          style={{ transformOrigin: '322px 468px', animation: 'sp1 4.9s ease-in-out infinite 0.35s' }} />
        <circle cx="28" cy="188" r="2.5" fill="#C97B96" opacity="0.48"
          style={{ transformOrigin: '28px 188px', animation: 'sp3 4.1s ease-in-out infinite 1.8s' }} />
        <circle cx="378" cy="180" r="2" fill="#D98FAC" opacity="0.6"
          style={{ transformOrigin: '378px 180px', animation: 'sp1 3.3s ease-in-out infinite 0.6s' }} />

        {/* ── Main floating group ── */}
        <g style={{ animation: 'hero-float 5.2s ease-in-out infinite', transformOrigin: '210px 350px' }}>

          {/* ══════════════════════════════
              WOMAN  (waist-up, arms out)
          ══════════════════════════════ */}

          {/* Torso / blouse — visible on the outer edges of the cake */}
          {/* Left torso strip */}
          <path d="M100 248 C96 260 94 280 96 305 L120 305 C118 282 118 262 122 250 Z" fill="#FFF8FA" />
          {/* Right torso strip */}
          <path d="M320 248 C324 260 326 280 324 305 L300 305 C302 282 302 262 298 250 Z" fill="#FFF8FA" />
          {/* Apron bib (small, visible above cake) */}
          <path d="M168 240 L252 240 L258 310 L162 310 Z" fill="#ECC0D0" opacity="0.8" />
          {/* Apron band */}
          <rect x="160" y="278" width="100" height="13" rx="6" fill="#C97B96" opacity="0.75" />
          {/* Left bow tail */}
          <path d="M160 284 C142 277 128 272 122 278 C119 283 126 290 140 292 C128 296 116 302 117 308 C130 305 148 299 160 294 Z" fill="#C97B96" opacity="0.65" />
          {/* Right bow tail */}
          <path d="M260 284 C278 277 292 272 298 278 C301 283 294 290 280 292 C292 296 304 302 303 308 C290 305 272 299 260 294 Z" fill="#C97B96" opacity="0.65" />

          {/* LEFT ARM — curves down to hold cake stand */}
          <path d="M122 254 C108 270 94 298 86 330 C79 355 78 388 82 420 C84 436 90 455 96 470"
            stroke="#F0C5A0" strokeWidth="32" strokeLinecap="round" fill="none" />
          {/* Left hand / palm under stand */}
          <ellipse cx="98" cy="478" rx="24" ry="13" fill="#F0C5A0" />
          <path d="M82 476 C84 484 90 487 96 485" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M89 480 C91 488 97 490 103 488" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M97 482 C99 490 105 491 111 489" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* RIGHT ARM */}
          <path d="M298 254 C312 270 326 298 334 330 C341 355 342 388 338 420 C336 436 330 455 324 470"
            stroke="#F0C5A0" strokeWidth="32" strokeLinecap="round" fill="none" />
          {/* Right hand */}
          <ellipse cx="322" cy="478" rx="24" ry="13" fill="#F0C5A0" />
          <path d="M338 476 C336 484 330 487 324 485" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M331 480 C329 488 323 490 317 488" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M323 482 C321 490 315 491 309 489" stroke="#EBB894" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Collar */}
          <path d="M168 240 C182 252 210 252 252 240 C242 250 226 256 210 256 C194 256 178 250 168 240 Z" fill="#F8F0F2" />

          {/* NECK */}
          <rect x="196" y="222" width="28" height="26" rx="10" fill="#F0C5A0" />

          {/* HEAD */}
          <ellipse cx="210" cy="170" rx="65" ry="68" fill="#F0C5A0" />
          {/* Ears */}
          <ellipse cx="146" cy="177" rx="9" ry="13" fill="#EBB894" />
          <ellipse cx="274" cy="177" rx="9" ry="13" fill="#EBB894" />
          <ellipse cx="146" cy="177" rx="5" ry="8" fill="#E0A882" opacity="0.5" />
          <ellipse cx="274" cy="177" rx="5" ry="8" fill="#E0A882" opacity="0.5" />

          {/* HAIR */}
          <ellipse cx="210" cy="143" rx="70" ry="58" fill="#2C1404" />
          <path d="M146 150 C140 172 138 205 143 228 L156 224 C150 204 148 175 154 153 Z" fill="#2C1404" />
          <path d="M274 150 C280 172 282 205 277 228 L264 224 C270 204 272 175 266 153 Z" fill="#2C1404" />
          {/* Bun */}
          <circle cx="210" cy="100" r="38" fill="#2C1404" />
          <ellipse cx="204" cy="94" rx="22" ry="18" fill="#3D1F10" opacity="0.5" />

          {/* Hair flower */}
          <ellipse cx="244" cy="100" rx="7" ry="12" fill="#D98FAC" opacity="0.9" />
          <ellipse cx="244" cy="100" rx="12" ry="7" fill="#D98FAC" opacity="0.9" />
          <ellipse cx="244" cy="100" rx="9" ry="12" fill="#D98FAC" opacity="0.82" transform="rotate(45 244 100)" />
          <ellipse cx="244" cy="100" rx="9" ry="12" fill="#D98FAC" opacity="0.82" transform="rotate(-45 244 100)" />
          <circle cx="244" cy="100" r="7" fill="#F5D5E8" />
          <circle cx="244" cy="100" r="3.5" fill="#C97B96" />

          {/* Face jaw overlay */}
          <ellipse cx="210" cy="182" rx="58" ry="60" fill="#F0C5A0" />

          {/* Eyebrows */}
          <path d="M184 158 C188 154 195 152 201 153" stroke="#2C1404" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M219 158 C225 154 232 152 237 153" stroke="#2C1404" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Left eye */}
          <ellipse cx="193" cy="170" rx="13" ry="11" fill="white" />
          <ellipse cx="194" cy="171" rx="8" ry="9" fill="#2C1404" />
          <ellipse cx="195" cy="171" rx="5" ry="6" fill="#5C3317" />
          <circle cx="196" cy="170" r="3" fill="#080302" />
          <circle cx="198" cy="167" r="1.8" fill="white" />
          <path d="M181 167 C184 163 189 162 193 163" stroke="#2C1404" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Right eye */}
          <ellipse cx="227" cy="170" rx="13" ry="11" fill="white" />
          <ellipse cx="226" cy="171" rx="8" ry="9" fill="#2C1404" />
          <ellipse cx="225" cy="171" rx="5" ry="6" fill="#5C3317" />
          <circle cx="224" cy="170" r="3" fill="#080302" />
          <circle cx="222" cy="167" r="1.8" fill="white" />
          <path d="M239 167 C236 163 231 162 227 163" stroke="#2C1404" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M207 188 C205 195 205 201 210 203 C215 201 215 195 213 188" stroke="#D4956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="206" cy="202" rx="4" ry="2.5" fill="#D4956A" opacity="0.35" />
          <ellipse cx="214" cy="202" rx="4" ry="2.5" fill="#D4956A" opacity="0.35" />

          {/* Smile */}
          <path d="M197 215 C203 225 217 225 223 215" stroke="#C97B96" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M197 215 C203 227 217 227 223 215" fill="#E8AAAA" opacity="0.4" />

          {/* Blush */}
          <ellipse cx="180" cy="202" rx="15" ry="8" fill="#F09898" opacity="0.2" />
          <ellipse cx="240" cy="202" rx="15" ry="8" fill="#F09898" opacity="0.2" />


          {/* ══════════════════════════════
              CAKE  (prominent, centered)
          ══════════════════════════════ */}

          {/* Stand base */}
          <ellipse cx="210" cy="556" rx="62" ry="11" fill="#D4B8A0" />
          <ellipse cx="210" cy="553" rx="62" ry="11" fill="#E0C8B0" />
          {/* Stand stem */}
          <path d="M201 526 C199 537 201 547 210 551 C219 547 221 537 219 526 Z" fill="#C8B098" />
          {/* Serving plate */}
          <ellipse cx="210" cy="526" rx="100" ry="14" fill="#EAD4BC" />
          <ellipse cx="210" cy="522" rx="100" ry="14" fill="#F5EAE0" />
          <ellipse cx="210" cy="520" rx="96" ry="12" fill="#FFFBF7" />

          {/* BOTTOM TIER */}
          <ellipse cx="210" cy="520" rx="88" ry="13" fill="#FFF8F0" />
          <rect x="122" y="474" width="176" height="47" rx="7" fill="#FFFCF8" />
          <ellipse cx="210" cy="474" rx="88" ry="13" fill="#FFF5EE" />
          {/* Drip */}
          <path d="M132 481 C138 490 145 486 152 492 C159 487 166 493 173 489 C180 495 187 490 194 495 C201 491 210 496 219 491 C226 496 233 491 240 494 C247 490 254 494 261 490 C268 493 275 488 282 491 C287 487 291 483 296 480"
            stroke="#FFF0E4" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Pink ribbon line */}
          <path d="M124 505 L296 505" stroke="#F0D0DC" strokeWidth="1.5" opacity="0.7" />
          {/* Bottom flowers */}
          {[142, 166, 188, 210, 232, 254, 278].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={506} r={i % 2 === 0 ? 8 : 6} fill="#E8B4C8" opacity="0.78" />
              <circle cx={x} cy={506} r={i % 2 === 0 ? 4 : 3} fill="#F8E0EC" opacity="0.9" />
              <circle cx={x} cy={506} r={i % 2 === 0 ? 1.8 : 1.3} fill="#C97B96" opacity="0.85" />
            </g>
          ))}
          {/* Bottom leaves */}
          {[154, 177, 199, 221, 243, 266].map((x, i) => (
            <ellipse key={i} cx={x} cy={507} rx="6" ry="2.8" fill="#8FAF7A" opacity="0.58" />
          ))}
          {/* Pearls */}
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i / 8) * Math.PI
            return (
              <circle key={i}
                cx={210 + 86 * Math.cos(Math.PI + t)}
                cy={474 + 12 * Math.sin(Math.PI + t) * 0.12}
                r="3.5" fill="#F0E4D5" opacity="0.88" />
            )
          })}

          {/* MIDDLE TIER */}
          <ellipse cx="210" cy="474" rx="70" ry="11" fill="#FFF8F0" />
          <rect x="140" y="428" width="140" height="47" rx="6" fill="#FFFCF8" />
          <ellipse cx="210" cy="428" rx="70" ry="11" fill="#FFF5EE" />
          {/* Drip */}
          <path d="M148 435 C153 444 159 440 165 446 C171 441 177 447 183 443 C189 449 195 444 201 449 C207 445 213 449 219 445 C225 449 231 445 237 448 C243 444 249 447 255 443 C261 440 265 437 270 434"
            stroke="#FFF0E4" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Middle flowers */}
          {[157, 181, 210, 239, 263].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={453} r="8" fill="#D98FAC" opacity="0.82" />
              <circle cx={x} cy={453} r="4" fill="#F8D8EC" opacity="0.9" />
              <circle cx={x} cy={453} r="1.8" fill="#A06080" opacity="0.9" />
            </g>
          ))}
          {/* Middle leaves */}
          {[169, 195, 224, 251].map((x, i) => (
            <ellipse key={i} cx={x} cy={454} rx="5" ry="2.2" fill="#8FAF7A" opacity="0.56" />
          ))}
          {/* Pearls */}
          {Array.from({ length: 7 }, (_, i) => {
            const t = (i / 6) * Math.PI
            return (
              <circle key={i}
                cx={210 + 68 * Math.cos(Math.PI + t)}
                cy={428 + 10 * Math.sin(Math.PI + t) * 0.12}
                r="3" fill="#F0E4D5" opacity="0.88" />
            )
          })}

          {/* TOP TIER */}
          <ellipse cx="210" cy="428" rx="51" ry="9" fill="#FFF8F0" />
          <rect x="159" y="386" width="102" height="43" rx="6" fill="#FFFCF8" />
          <ellipse cx="210" cy="386" rx="51" ry="9" fill="#FFF5EE" />
          {/* Drip */}
          <path d="M164 393 C168 401 173 397 178 403 C183 399 188 404 193 400 C198 405 204 401 210 405 C216 401 222 405 227 401 C232 405 237 401 242 397 C247 394 251 391 255 388"
            stroke="#FFF0E4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Top flowers */}
          {[173, 194, 210, 226, 247].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={408} r="6" fill="#C97B96" opacity="0.75" />
              <circle cx={x} cy={408} r="2.8" fill="#F8D8EC" opacity="0.9" />
              <circle cx={x} cy={408} r="1.3" fill="#A06080" opacity="0.9" />
            </g>
          ))}

          {/* TOPPER bouquet */}
          <ellipse cx="210" cy="378" rx="7" ry="12" fill="#E0A0BC" opacity="0.9" />
          <ellipse cx="210" cy="400" rx="7" ry="12" fill="#E0A0BC" opacity="0.9" />
          <ellipse cx="197" cy="389" rx="12" ry="7" fill="#E0A0BC" opacity="0.9" />
          <ellipse cx="223" cy="389" rx="12" ry="7" fill="#E0A0BC" opacity="0.9" />
          <ellipse cx="200" cy="379" rx="7" ry="9" fill="#D98FAC" opacity="0.82" transform="rotate(-45 200 379)" />
          <ellipse cx="220" cy="379" rx="7" ry="9" fill="#D98FAC" opacity="0.82" transform="rotate(45 220 379)" />
          <ellipse cx="200" cy="399" rx="7" ry="9" fill="#D98FAC" opacity="0.82" transform="rotate(45 200 399)" />
          <ellipse cx="220" cy="399" rx="7" ry="9" fill="#D98FAC" opacity="0.82" transform="rotate(-45 220 399)" />
          <circle cx="210" cy="389" r="10" fill="#F5D5E8" />
          <circle cx="210" cy="389" r="5.5" fill="#C97B96" />
          <circle cx="210" cy="389" r="2.5" fill="#F5D5E8" />
          {/* Side topper flowers */}
          <circle cx="187" cy="391" r="8" fill="#D98FAC" opacity="0.8" />
          <circle cx="187" cy="391" r="4" fill="#F5D5E8" opacity="0.9" />
          <circle cx="187" cy="391" r="1.8" fill="#A06080" />
          <circle cx="233" cy="391" r="8" fill="#D98FAC" opacity="0.8" />
          <circle cx="233" cy="391" r="4" fill="#F5D5E8" opacity="0.9" />
          <circle cx="233" cy="391" r="1.8" fill="#A06080" />
          <ellipse cx="196" cy="399" rx="8" ry="3" fill="#8FAF7A" opacity="0.72" transform="rotate(28 196 399)" />
          <ellipse cx="224" cy="399" rx="8" ry="3" fill="#8FAF7A" opacity="0.72" transform="rotate(-28 224 399)" />

          {/* CANDLE */}
          <rect x="206" y="353" width="8" height="34" rx="4" fill="#F5E0B0" />
          <path d="M206 361 Q210 358 214 361" stroke="#E8D0A0" strokeWidth="1.5" fill="none" />
          <path d="M206 371 Q210 368 214 371" stroke="#E8D0A0" strokeWidth="1.5" fill="none" />
          {/* Flame */}
          <g style={{ animation: 'flicker 0.85s ease-in-out infinite', transformOrigin: '210px 344px' }}>
            <ellipse cx="210" cy="345" rx="5.5" ry="9" fill="#FFD048" opacity="0.9" />
            <ellipse cx="210" cy="343" rx="3.2" ry="5.5" fill="#FF9A00" opacity="0.88" />
            <ellipse cx="210" cy="342" rx="1.8" ry="3.2" fill="white" opacity="0.92" />
          </g>

        </g>{/* end hero-float */}
      </svg>
    </div>
  )
}
