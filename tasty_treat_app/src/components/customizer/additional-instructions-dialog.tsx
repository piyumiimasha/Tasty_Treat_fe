"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

interface AdditionalInstructionsDialogProps {
  value: string
  onChange: (val: string) => void
}

export default function AdditionalInstructionsDialog({ value, onChange }: AdditionalInstructionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleOpen = () => {
    setDraft(value)
    setOpen(true)
  }

  const handleDone = () => {
    onChange(draft)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-accent/50 hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate">
          {value ? value : "Add special instructions (allergens, occasion, message on cake…)"}
        </span>
        {value && (
          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full flex-shrink-0">
            {value.length} chars
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Special Instructions</DialogTitle>
            <DialogDescription>
              Allergens, occasion details, message on cake, delivery notes…
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Please write 'Happy Birthday Sarah' on top. Nut-free please."
            rows={5}
            className="resize-none"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleDone}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
