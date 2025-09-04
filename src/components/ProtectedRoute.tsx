import { useEffect, useState, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/supabase.ts'
import { User } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { user, error } = await getCurrentUser()
      if (error) throw error
      setUser(user)
    } catch (error: any) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute