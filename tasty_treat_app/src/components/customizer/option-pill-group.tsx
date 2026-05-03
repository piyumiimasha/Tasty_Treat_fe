interface OptionItem {
  id: string
  label: string
  price: number
}

interface OptionPillGroupProps {
  label: string
  options: OptionItem[]
  selected: string | string[]
  multiSelect: boolean
  onChange: (value: string | string[]) => void
}

export default function OptionPillGroup({ label, options, selected, multiSelect, onChange }: OptionPillGroupProps) {
  const isSelected = (id: string) =>
    multiSelect ? (selected as string[]).includes(id) : selected === id

  const handleClick = (id: string) => {
    if (multiSelect) {
      const arr = selected as string[]
      onChange(arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id])
    } else {
      onChange(id)
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleClick(opt.id)}
            className={`px-3.5 py-1 rounded-full text-sm font-medium border transition-all duration-150 ${
              isSelected(opt.id)
                ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
                : "bg-secondary/50 border-border text-foreground hover:bg-muted hover:border-accent/40"
            }`}
          >
            {opt.label}
            {opt.price > 0 && (
              <span className={`ml-1.5 text-xs ${isSelected(opt.id) ? "text-white/80" : "text-muted-foreground"}`}>
                +Rs.{opt.price}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
