interface VibeTagProps {
  tag: string
}

export function VibeTag({ tag }: VibeTagProps) {
  return (
    <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
      {tag}
    </span>
  )
}
