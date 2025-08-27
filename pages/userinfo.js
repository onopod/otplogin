import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function UserInfoPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, username, password }),
      })

      const data = await response.json()

      if (data.status === 'registered') {
        // 登録成功 → CompletePageへ
        router.push('/complete')
      } else if (data.status === 'not_verified') {
        // 電話番号が認証されていない場合
        alert('電話番号の認証が確認できません。最初からやり直してください。')
        router.push('/register')
      } else {
        // DB障害 → 同じページでエラー表示
        setError('登録処理でエラーが発生しました。もう一度お試しください。')
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>ユーザー情報入力</h1>
      <p>
        電話番号の認証が完了しました。<br/>
        アカウント情報を入力してください。
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="taro"
            required
            minLength="3"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            required
            minLength="6"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
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
          disabled={loading || username.length < 3 || password.length < 6}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: (loading || username.length < 3 || password.length < 6) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || username.length < 3 || password.length < 6) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '登録中...' : 'アカウントを作成'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>認証済み電話番号: {phone}</p>
      </div>
    </div>
  )
}