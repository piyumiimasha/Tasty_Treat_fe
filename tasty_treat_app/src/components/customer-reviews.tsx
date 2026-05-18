"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

const REVIEWS = [
  {
    name: "Priya M.",
    location: "Colombo",
    rating: 5,
    text: "Absolutely stunning! The three-tier floral cake was even more beautiful in person. Every guest was asking where we ordered it from. Could not have asked for more.",
  },
  {
    name: "Kamal S.",
    location: "Kandy",
    rating: 5,
    text: "Ordered a custom chocolate cake for my daughter's birthday. The decorations were so detailed and the sponge was incredibly moist. She absolutely loved every bite.",
  },
  {
    name: "Amali W.",
    location: "Galle",
    rating: 5,
    text: "The customizer made it so easy to design exactly what I wanted. The AI preview matched the final cake almost perfectly. Will definitely be ordering again.",
  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="w-3.5 h-3.5"
          fill={i < rating ? "#C97B96" : "none"}
          stroke={i < rating ? "#C97B96" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function ReviewItem({ review, index }: { review: typeof REVIEWS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const initials = review.name.split(" ").map(w => w[0]).join("").slice(0, 2)

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <StarRow rating={review.rating} />

      <p className="text-base leading-relaxed text-foreground">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #A0526E, #C97B96)" }}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary leading-none">{review.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{review.location}</p>
        </div>
      </div>
    </div>
  )
}

export default function CustomerReviews() {
  return (
    <section className="w-full border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-accent" />
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-accent">Customer Love</span>
        </div>
        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary leading-none mb-16">
          What Our Customers Say
        </h2>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {REVIEWS.map((review, i) => (
            <ReviewItem key={review.name} review={review} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
