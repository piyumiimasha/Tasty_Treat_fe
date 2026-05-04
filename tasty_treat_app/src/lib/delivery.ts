const BAKERY_ADDRESS = process.env.NEXT_PUBLIC_BAKERY_ADDRESS || "Colombo, Sri Lanka"
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || ""
export const RATE_PER_KM = 100

// Nominatim geocoding restricted to Sri Lanka — better accuracy for LK addresses
async function geocode(address: string): Promise<[number, number]> {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(address)}` +
    `&format=json&limit=1&countrycodes=lk`
  const res = await fetch(url, { headers: { "User-Agent": "TastyTreat/1.0" } })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = await res.json()
  if (!data.length) throw new Error(`Could not find location: "${address}"`)
  const { lon, lat } = data[0]
  console.log(`[geocode] "${address}" → [${lon}, ${lat}]`)
  return [parseFloat(lon), parseFloat(lat)]
}

export async function calculateDeliveryFee(
  customerAddress: string
): Promise<{ fee: number; distanceKm: number }> {
  if (!ORS_API_KEY) throw new Error("ORS API key is not configured. Restart the dev server after adding it to .env.local.")

  const [bakeryCoords, customerCoords] = await Promise.all([
    geocode(BAKERY_ADDRESS),
    geocode(customerAddress),
  ])

  const res = await fetch(
    "https://api.openrouteservice.org/v2/matrix/driving-car",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({
        locations: [bakeryCoords, customerCoords],
        sources: [0],
        destinations: [1],
        metrics: ["distance"],
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Matrix API failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  console.log("[ors matrix]", JSON.stringify(data))

  const meters: number = data.distances?.[0]?.[0]
  if (meters == null) throw new Error(`Could not calculate route between the two locations.`)

  const distanceKm = Math.round((meters / 1000) * 10) / 10
  const fee = Math.round(distanceKm) * RATE_PER_KM

  return { fee, distanceKm }
}
