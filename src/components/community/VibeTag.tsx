interface VibeTagProps {
  tag: string
}

export function VibeTag({ tag }: VibeTagProps) {
  return (
    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
      {tag}
    </span>
  )
}
