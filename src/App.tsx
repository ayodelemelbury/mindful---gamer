import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AppShell } from "./components/layout/AppShell"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { useAndroidBackButton } from "./hooks/useAndroidBackButton"

// Wrapper component to use the back button hook within Router context
function BackButtonHandler({ children }: { children: React.ReactNode }) {
  useAndroidBackButton()
  return <>{children}</>
}

const HomePage = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.HomePage }))
)
const InsightsPage = lazy(() =>
  import("./pages/Insights").then((m) => ({ default: m.InsightsPage }))
)
const CommunityPage = lazy(() =>
  import("./pages/Community").then((m) => ({ default: m.CommunityPage }))
)
const SettingsPage = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.SettingsPage }))
)
const ProfilePage = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.ProfilePage }))
)
const GameDetailPage = lazy(() =>
  import("./pages/GameDetail").then((m) => ({ default: m.GameDetailPage }))
)
const AuthPage = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.AuthPage }))
)

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
      Loading...
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <BackButtonHandler>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<HomePage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="/game/:gameId" element={<GameDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BackButtonHandler>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
