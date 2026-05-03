import type { Metadata } from "next"
import CustomizerShell from "@/components/customizer/customizer-shell"

export const metadata: Metadata = {
  title: "Customize Your Cake — Tasty Treat",
  description: "Design a unique cake with your choice of layers, shape, frosting, flavour, and more. Get an AI-generated preview instantly.",
}

export default function CustomizePage() {
  return (
    <main className="min-h-screen bg-background">
      <CustomizerShell />
    </main>
  )
}
