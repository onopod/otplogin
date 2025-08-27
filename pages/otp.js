import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OtpPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const router = useRouter()

  useEffect(() => {
    // URLからphone番号を取得
    if (router.query.phone) {
      setPhone(router.query.phone)
    }
  }, [router.query.phone])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (data.status === 'verified') {
        // OTP認証成功 → ユーザー情報入力ページへ
        router.push(`/userinfo?phone=${encodeURIComponent(phone)}`)
      } else if (data.status === 'invalid') {
        // OTP不一致 → 同じページで再入力
        setError('認証コードが間違っています。もう一度入力してください。')
        setCode('')
      } else if (data.status === 'expired_or_not_found') {
        // OTP期限切れ → RegisterPageに戻る（再リクエスト可能）
        alert('認証コードの有効期限が切れました。もう一度電話番号から始めてください。')
        router.push('/register')
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/register')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>SMS認証</h1>
      <p>
        {phone} にSMSで送信された6桁の認証コードを入力してください。
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="code" style={{ display: 'block', marginBottom: '5px' }}>
            認証コード
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength="6"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '18px',
              letterSpacing: '2px',
            }}
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: (loading || code.length !== 6) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
          }}
        >
          {loading ? '認証中...' : '認証する'}
        </button>

        <button
          type="button"
          onClick={handleBack}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          電話番号を変更する
        </button>
      </form>
    </div>
  )
}