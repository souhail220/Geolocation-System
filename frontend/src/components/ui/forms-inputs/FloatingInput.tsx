export default function FloatingInput({ label, type, value, onChange, autoComplete }: Readonly<{
  type: string,
  value: string,
  onChange: (v: string) => void,
  autoComplete?: string,
  label?: string
}>) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer w-full rounded-md border border-border bg-white px-3 pt-5 pb-2 text-sm outline-none transition-colors focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/30"
      />
      <label className="pointer-events-none absolute left-3 top-1.5 text-[11px] font-medium text-slate transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-blue-accent">
        {label}
      </label>
    </div>
  );
}