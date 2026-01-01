import { useState } from 'react'
import { reportContent } from '../../lib/moderationService'
import type { ReportReason, ContentType } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2 } from 'lucide-react'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentType: ContentType
  contentId: string
  reporterId: string | null
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Promotional or repetitive content' },
  { value: 'inappropriate', label: 'Inappropriate', description: 'Offensive or harmful content' },
  { value: 'misleading', label: 'Misleading', description: 'False or inaccurate information' },
  { value: 'other', label: 'Other', description: 'Another issue not listed above' },
]

export function ReportDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  reporterId,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>('spam')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!reporterId) return

    setIsSubmitting(true)
    setError(null)

    try {
      await reportContent({
        contentType,
        contentId,
        reporterId,
        reason,
        details,
      })
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setReason('spam')
        setDetails('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!reporterId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to report content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <p className="text-green-600 font-medium">Report submitted!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Thank you for helping keep our community safe.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Reason for report</Label>
              <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                {REPORT_REASONS.map((r) => (
                  <div key={r.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                    <Label htmlFor={r.value} className="cursor-pointer">
                      <span className="font-medium">{r.label}</span>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
