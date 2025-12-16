import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'

const CATEGORIES = ['RPG', 'Casual', 'FPS', 'Platformer', 'Roguelike', 'Strategy', 'Sports', 'Other'] as const
const VIBE_TAGS = ['Relaxing', 'Challenging', 'Social', 'Immersive', 'Short sessions', 'Competitive', 'Creative'] as const

interface AddGameDialogProps {
  trigger?: React.ReactNode
  onGameAdded?: () => void
}

export function AddGameDialog({ trigger, onGameAdded }: AddGameDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const addGame = useSessionStore((s) => s.addGame)

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category) return

    addGame({
      name: name.trim(),
      category,
      vibeTags: selectedTags,
    })

    // Reset form
    setName('')
    setCategory('')
    setSelectedTags([])
    setOpen(false)
    onGameAdded?.()
  }

  const isValid = name.trim().length > 0 && category.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="icon" variant="outline" className="shrink-0">
            <Plus size={18} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">Game Name</Label>
            <Input
              id="game-name"
              placeholder="e.g., Minecraft"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vibe Tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleTagToggle(tag)}
                >
                  {selectedTags.includes(tag) && <X size={12} className="mr-1" />}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              Add Game
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
