import { NextRequest, NextResponse } from "next/server"

const PIXAZO_BASE = "https://gateway.pixazo.ai"
const GENERATE_URL = `${PIXAZO_BASE}/getImage/v1/getSDXLImage`
const STATUS_URL   = (id: string) => `${PIXAZO_BASE}/v2/requests/status/${id}`

export async function POST(req: NextRequest) {
  const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY?.trim()

  if (!PIXAZO_API_KEY) {
    return NextResponse.json({ imageUrl: null, fallback: true, message: "AI preview not configured." })
  }

  const { layers, shape, frosting, flavour, topper, color, decorations, dietary, instructions } = await req.json()

  const topperStr      = topper && topper.toLowerCase() !== "none"
    ? `, decorated with ${topper}`
    : ""
  const colorStr       = color ? `, in ${color} color theme` : ""
  const decorStr       = Array.isArray(decorations) && decorations.length > 0
    ? `, with ${decorations.join(" and ")} decorations`
    : ""
  const dietaryStr     = Array.isArray(dietary) && dietary.length > 0
    ? `, ${dietary.join(" and ")} friendly`
    : ""
  const instrStr       = instructions ? `. Additional details: ${instructions}` : ""

  const prompt =
    `A stunning ${layers}-layer ${shape}-shaped celebration cake ` +
    `with ${frosting} frosting and ${flavour} flavour` +
    `${topperStr}${colorStr}${decorStr}${dietaryStr}${instrStr}. ` +
    `Photorealistic professional bakery photography, elegant presentation, ` +
    `soft natural studio lighting, pure white background, ultra high detail.`

  const pixazoHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
  }

  try {
    // Submit generation request
    const genRes = await fetch(GENERATE_URL, {
      method: "POST",
      headers: pixazoHeaders,
      body: JSON.stringify({ prompt }),
    })

    if (!genRes.ok) {
      const err = await genRes.text()
      return NextResponse.json({ error: `Generation request failed: ${err}` }, { status: 502 })
    }

    const genData = await genRes.json()
    console.log("[Pixazo] response:", JSON.stringify(genData))

    // Synchronous response — image returned directly
    if (genData.imageUrl)        return NextResponse.json({ imageUrl: genData.imageUrl })
    if (genData.image_url)       return NextResponse.json({ imageUrl: genData.image_url })
    if (genData.output?.media_url) return NextResponse.json({ imageUrl: genData.output.media_url })
    if (genData.url)             return NextResponse.json({ imageUrl: genData.url })
    if (genData.data?.[0]?.url)  return NextResponse.json({ imageUrl: genData.data[0].url })

    // Async response — poll with request_id
    const requestId: string = genData.request_id ?? genData.id
    if (!requestId) {
      return NextResponse.json(
        { error: "Unexpected Pixazo response", detail: genData },
        { status: 502 }
      )
    }

    // Poll until COMPLETED or FAILED (max 90s, every 3s)
    const deadline = Date.now() + 90_000

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000))

      const pollRes = await fetch(STATUS_URL(requestId), {
        headers: { "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY },
      })

      if (!pollRes.ok) break

      const poll = await pollRes.json()
      console.log("[Pixazo] poll:", JSON.stringify(poll))

      if (poll.status === "COMPLETED") {
        const imageUrl = poll.output?.media_url ?? poll.image_url ?? poll.url ?? null
        if (!imageUrl) return NextResponse.json({ error: "No image URL in completed response" }, { status: 502 })
        return NextResponse.json({ imageUrl })
      }

      if (poll.status === "FAILED" || poll.status === "ERROR") {
        return NextResponse.json({ error: poll.message ?? "Generation failed" }, { status: 502 })
      }
    }

    return NextResponse.json({ error: "Timed out waiting for image generation" }, { status: 504 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Network error calling Pixazo" }, { status: 500 })
  }
}
