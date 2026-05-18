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
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-1 h-3.5 rounded-full" style={{ background: "#D98FAC" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#A0526E" }}>{label}</p>
        {multiSelect && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1"
            style={{ background: "#fde0ef", color: "#C97B96" }}>
            multi
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleClick(opt.id)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
            style={isSelected(opt.id) ? {
              background: "linear-gradient(135deg, #A0526E, #C97B96)",
              color: "white",
              border: "1.5px solid #A0526E",
              boxShadow: "0 2px 8px rgba(160,82,110,0.25)",
            } : {
              background: "rgba(255,255,255,0.7)",
              color: "var(--foreground)",
              border: "1.5px solid #f0cede",
            }}
          >
            {opt.label}
            {opt.price > 0 && (
              <span className="ml-1.5 text-xs" style={{ opacity: isSelected(opt.id) ? 0.8 : 0.55 }}>
                +Rs.{opt.price}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
