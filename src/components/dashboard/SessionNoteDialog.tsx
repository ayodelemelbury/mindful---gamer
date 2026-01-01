/**
 * SessionNoteDialog Component
 *
 * Optional dialog shown after stopping a session to add a note.
 * Notes are optional - user can skip or add a brief reflection.
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare } from "lucide-react"
import { formatDuration } from "@/lib/formatDuration"

interface SessionNoteDialogProps {
  open: boolean
  onClose: () => void
  onSave: (note: string) => void
  gameName: string
  duration: number
}

export function SessionNoteDialog({
  open,
  onClose,
  onSave,
  gameName,
  duration,
}: SessionNoteDialogProps) {
  const [note, setNote] = useState("")

  const handleSave = () => {
    onSave(note.trim())
    setNote("")
  }

  const handleSkip = () => {
    onSave("")
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Session Complete!
          </DialogTitle>
          <DialogDescription>
            You played <span className="font-medium">{gameName}</span> for{" "}
            <span className="font-medium">{formatDuration(duration)}</span>.
            Add an optional note about your session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="note">How was your session? (optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g., Great match! Reached new high score..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/200
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSave}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
