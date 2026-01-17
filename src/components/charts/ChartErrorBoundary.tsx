import { Component, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ChartErrorBoundary] Chart failed to render:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {this.props.fallbackMessage || 'Unable to load chart'}
            </p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
