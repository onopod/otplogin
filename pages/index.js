import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to register page
    router.push('/register')
  }, [router])

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <p>リダイレクト中...</p>
    </div>
  )
}