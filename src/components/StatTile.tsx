type Props = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: React.ReactNode
  hint?: string
  detail?: string | null // texto extra debajo (por ejemplo, el título de un libro)
  accent?: string
}

// Tarjeta de estadística con ícono y un ícono gigante decorativo de fondo
export default function StatTile({ icon: Icon, label, value, hint, detail, accent = '#d9b26f' }: Props) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <Icon size={120} className="pointer-events-none absolute -bottom-6 -right-5 opacity-[0.07]" />
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl border"
          style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
        >
          <Icon size={19} />
        </span>
        <span className="text-sm font-bold" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold text-parchment">{value}</span>
        {hint && <span className="text-sm text-dust">{hint}</span>}
      </p>
      {detail && (
        <p className="mt-1 font-display text-lg italic leading-snug text-parchment/80">{detail}</p>
      )}
    </div>
  )
}