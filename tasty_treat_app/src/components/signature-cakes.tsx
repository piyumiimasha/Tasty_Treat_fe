"use client"

import { Cake } from "@/lib/mappers/item-mapper"

// ─── Butter Cake Illustration ────────────────────────────────────────────────

function ButterCake() {
  return (
    <svg viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
      {/* Plate shadow */}
      <ellipse cx="130" cy="306" rx="88" ry="9" fill="#00000012" />
      {/* Plate */}
      <ellipse cx="130" cy="298" rx="88" ry="11" fill="#E2C98C" />
      <rect x="42" y="288" width="176" height="12" fill="#EDD89A" />
      <ellipse cx="130" cy="288" rx="88" ry="11" fill="#F5E6C0" />

      {/* Tier 1 — bottom */}
      <rect x="42" y="228" width="176" height="62" rx="3" fill="#F5DFA0" />
      <ellipse cx="130" cy="290" rx="88" ry="10" fill="#DFC880" />
      <ellipse cx="130" cy="228" rx="88" ry="13" fill="#FFFCF0" />
      {/* ribbon */}
      <rect x="42" y="252" width="176" height="5" rx="2" fill="#EDD07888" />

      {/* Tier 2 — middle */}
      <rect x="66" y="172" width="128" height="59" rx="3" fill="#F0D890" />
      <ellipse cx="130" cy="231" rx="64" ry="8" fill="#D8BC6C" />
      <ellipse cx="130" cy="172" rx="64" ry="11" fill="#FFFCF0" />
      {/* ribbon */}
      <rect x="66" y="194" width="128" height="4" rx="2" fill="#E0C06088" />

      {/* Tier 3 — top */}
      <rect x="92" y="124" width="76" height="51" rx="3" fill="#EAD080" />
      <ellipse cx="130" cy="175" rx="38" ry="7" fill="#CCAA58" />
      <ellipse cx="130" cy="124" rx="38" ry="9" fill="#FFFCF0" />

      {/* Frosting drips tier 1 */}
      {[58, 80, 100, 120, 140, 162, 184, 204].map((x, i) => (
        <ellipse key={i} cx={x} cy={229} rx="5" ry="7" fill="#FFFCF0" />
      ))}
      {/* Frosting drips tier 2 */}
      {[76, 96, 116, 136, 156, 176].map((x, i) => (
        <ellipse key={i} cx={x} cy={173} rx="4" ry="6" fill="#FFFCF0" />
      ))}

      {/* Top flowers */}
      {/* Leaves */}
      <ellipse cx="118" cy="116" rx="9" ry="5" fill="#7BBF50" transform="rotate(-25 118 116)" />
      <ellipse cx="142" cy="116" rx="9" ry="5" fill="#6AAF40" transform="rotate(25 142 116)" />
      {/* Flower 1 */}
      {[0,72,144,216,288].map((deg, i) => (
        <ellipse key={i} cx={116 + 8 * Math.cos(deg * Math.PI / 180)} cy={109 + 6 * Math.sin(deg * Math.PI / 180)} rx="5" ry="5" fill="#FFAEC0" />
      ))}
      <circle cx="116" cy="109" r="4" fill="#FF85A0" />
      {/* Flower 2 */}
      {[0,72,144,216,288].map((deg, i) => (
        <ellipse key={i} cx={130 + 9 * Math.cos(deg * Math.PI / 180)} cy={105 + 7 * Math.sin(deg * Math.PI / 180)} rx="6" ry="6" fill="#FFC0CB" />
      ))}
      <circle cx="130" cy="105" r="5" fill="#FF85A0" />
      {/* Flower 3 */}
      {[0,72,144,216,288].map((deg, i) => (
        <ellipse key={i} cx={144 + 8 * Math.cos(deg * Math.PI / 180)} cy={109 + 6 * Math.sin(deg * Math.PI / 180)} rx="5" ry="5" fill="#FFAEC0" />
      ))}
      <circle cx="144" cy="109" r="4" fill="#FF85A0" />

      {/* Small pearl decorations on tiers */}
      {[60, 90, 120, 150, 180, 200].map((x, i) => (
        <circle key={i} cx={x} cy={252} r="2.5" fill="#FFFCF0" opacity="0.9" />
      ))}
      {[78, 106, 132, 158, 182].map((x, i) => (
        <circle key={i} cx={x} cy={194} r="2" fill="#FFFCF0" opacity="0.9" />
      ))}
    </svg>
  )
}

// ─── Chocolate Cake Illustration ─────────────────────────────────────────────

function ChocolateCake() {
  return (
    <svg viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
      {/* Plate shadow */}
      <ellipse cx="130" cy="306" rx="92" ry="9" fill="#00000018" />
      {/* Plate */}
      <ellipse cx="130" cy="298" rx="92" ry="11" fill="#C8A060" />
      <rect x="38" y="288" width="184" height="12" fill="#D4AA70" />
      <ellipse cx="130" cy="288" rx="92" ry="11" fill="#E0BC88" />

      {/* Tier 1 — bottom (taller) */}
      <rect x="38" y="198" width="184" height="92" rx="3" fill="#3D1A08" />
      <ellipse cx="130" cy="290" rx="92" ry="11" fill="#2D1005" />
      {/* Ganache top */}
      <ellipse cx="130" cy="198" rx="92" ry="14" fill="#4E200A" />
      {/* Ganache drips tier 1 */}
      {[52, 74, 96, 116, 140, 162, 184, 205].map((x, i) => (
        <rect key={i} x={x - 5} y={198} width="10" height={14 + (i % 3) * 6} rx="5" fill="#2D1005" />
      ))}
      {/* Highlight stripe */}
      <rect x="38" y="230" width="184" height="6" rx="3" fill="#5A2510" opacity="0.7" />

      {/* Tier 2 — top */}
      <rect x="66" y="118" width="128" height="83" rx="3" fill="#4A1E0C" />
      <ellipse cx="130" cy="201" rx="64" ry="9" fill="#311205" />
      {/* Ganache top tier 2 */}
      <ellipse cx="130" cy="118" rx="64" ry="11" fill="#5C2510" />
      {/* Ganache drips tier 2 */}
      {[74, 96, 116, 140, 162, 178].map((x, i) => (
        <rect key={i} x={x - 4} y={118} width="8" height={12 + (i % 2) * 8} rx="4" fill="#2D1005" />
      ))}
      {/* Highlight stripe */}
      <rect x="66" y="148" width="128" height="5" rx="3" fill="#602A14" opacity="0.7" />

      {/* Strawberries on top */}
      {/* Berry 1 */}
      <path d="M108 100 Q103 88 113 83 Q120 80 118 90 Z" fill="#CC2040" />
      <path d="M108 100 Q113 88 123 90 Q126 98 118 100 Z" fill="#CC2040" />
      <ellipse cx="113" cy="95" rx="6" ry="7" fill="#E03050" />
      {[111,115,113,110,116].map((x,i) => <circle key={i} cx={x} cy={92 + (i%3)} r="0.8" fill="#FFD0D0" />)}
      <rect x="112" y="83" width="3" height="5" rx="1" fill="#5A8A20" transform="rotate(-10 112 83)" />

      {/* Berry 2 */}
      <path d="M130 96 Q125 84 135 79 Q142 76 140 86 Z" fill="#CC2040" />
      <path d="M130 96 Q135 84 145 86 Q148 94 140 96 Z" fill="#CC2040" />
      <ellipse cx="135" cy="90" rx="6" ry="7" fill="#E03050" />
      {[133,137,135,132,138].map((x,i) => <circle key={i} cx={x} cy={87 + (i%3)} r="0.8" fill="#FFD0D0" />)}
      <rect x="134" y="79" width="3" height="5" rx="1" fill="#5A8A20" transform="rotate(10 134 79)" />

      {/* Berry 3 smaller */}
      <ellipse cx="150" cy="96" rx="5" ry="6" fill="#D02848" />
      {[148,152,150,147,153].map((x,i) => <circle key={i} cx={x} cy={94 + (i%2)} r="0.7" fill="#FFD0D0" />)}
      <rect x="149" y="90" width="2" height="4" rx="1" fill="#5A8A20" />

      {/* Chocolate shavings/curls */}
      <path d="M88 113 Q92 108 96 113" stroke="#2D1005" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M164 110 Q168 105 172 110" stroke="#2D1005" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M118 108 Q122 103 126 108" stroke="#2D1005" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// ─── Name → Illustration map ──────────────────────────────────────────────────

function getIllustration(name: string) {
  const n = name.toLowerCase()
  if (n.includes("butter")) return <ButterCake />
  if (n.includes("chocolate") || n.includes("choco")) return <ChocolateCake />
  return null
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SignatureCakesProps {
  cakes: Cake[]
  onSelect: (cake: Cake) => void
}

export default function SignatureCakes({ cakes, onSelect }: SignatureCakesProps) {
  if (cakes.length === 0) return null

  return (
    <div className="mb-16">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-7 h-px bg-accent" />
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-accent">
          Our Signatures
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-16">
        {cakes.map((cake) => {
          const illustration = getIllustration(cake.name)
          return (
            <button
              key={cake.id}
              onClick={() => onSelect(cake)}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              {/* Cake image / illustration — no card, no background */}
              <div className="relative w-full max-w-[280px] mx-auto mb-6"
                style={{ height: "clamp(220px, 28vw, 320px)" }}>
                {cake.images[0] ? (
                  <img
                    src={cake.images[0]}
                    alt={cake.name}
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:-translate-y-3 drop-shadow-2xl"
                    onError={(e) => {
                      // image failed — swap in SVG illustration
                      const el = e.currentTarget
                      el.style.display = "none"
                      el.nextElementSibling?.removeAttribute("hidden")
                    }}
                  />
                ) : null}
                {/* SVG fallback — shown when no image or image fails to load */}
                <div
                  className="w-full h-full transition-transform duration-500 ease-out group-hover:-translate-y-3"
                  hidden={!!cake.images[0]}
                >
                  {illustration}
                </div>
              </div>

              {/* Text — below the cake, no container */}
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
                Signature
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-1 leading-tight">
                {cake.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 capitalize">{cake.flavor}</p>
              <p className="font-serif text-xl font-bold text-primary mb-5">
                Rs. {cake.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ {cake.size}</span>
              </p>

              {/* CTA */}
              <span
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  opacity: 0.88,
                }}
              >
                Order Now →
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
