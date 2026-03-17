import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader2 } from 'lucide-react'

const ADMIN_EMAIL = 'hcrx20@gmail.com'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AdminRoute
