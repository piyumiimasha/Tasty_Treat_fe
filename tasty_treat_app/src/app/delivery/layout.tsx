import DeliveryAuthGuard from "@/components/delivery/auth-guard"

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <DeliveryAuthGuard>{children}</DeliveryAuthGuard>
}
