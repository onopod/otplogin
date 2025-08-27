import { useRouter } from 'next/router'

export default function CompletePage() {
  const router = useRouter()

  const handleLogin = () => {
    // ログインページへの導線
    // 実際のアプリではログインページに遷移
    alert('ログイン機能は未実装です。')
  }

  const handleNewRegistration = () => {
    // 新しい登録を開始
    router.push('/register')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '48px', 
          color: '#28a745', 
          marginBottom: '20px' 
        }}>
          ✓
        </div>
        <h1 style={{ color: '#28a745', marginBottom: '10px' }}>
          登録完了！
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          アカウントの作成が正常に完了しました。
        </p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>次のステップ</h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
          作成したアカウントでログインして、<br/>
          サービスをご利用いただけます。
        </p>
      </div>

      <button
        onClick={handleLogin}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '10px',
        }}
      >
        ログインページへ
      </button>

      <button
        onClick={handleNewRegistration}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        別のアカウントを作成
      </button>
    </div>
  )
}