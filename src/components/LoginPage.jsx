import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⚓</div>
          <h1 className="text-[28px] font-bold text-black tracking-tight">Yacht Maintenance</h1>
          <p className="text-[15px] text-[#8E8E93] mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-[12px] overflow-hidden divide-y divide-black/[0.08] mb-4">
            <div className="px-4 py-3">
              <p className="text-[12px] text-[#6C6C70] mb-1">Email</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
              />
            </div>
            <div className="px-4 py-3">
              <p className="text-[12px] text-[#6C6C70] mb-1">Password</p>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {error && (
            <p className="text-[#FF3B30] text-[13px] text-center mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#007AFF] text-white rounded-[12px] py-[14px] text-[17px] font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-[13px] text-[#8E8E93] text-center mt-8">
          Access is by invitation only.
        </p>
      </div>
    </div>
  )
}
