import { startRecording, stopRecording } from './lib/recording.js'
import { analyzeSentiment } from './lib/sentiment.js'
import { supabase } from './lib/supabase.js'
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Onboarding from './Onboarding.jsx'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("goal")
          .eq("id", session.user.id)
          .single()
        setOnboarded(!!data?.goal)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  if (!session || !onboarded) return (
    <div style={{
      minHeight: "100vh",
      background: "#050810",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans',-apple-system,sans-serif"
    }}>
      <div style={{
        width: 375,
        minHeight: 812,
        background: "#070B14",
        borderRadius: 44,
        border: "3px solid #1E2A45",
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,.6)"
      }}>
        <Onboarding onComplete={() => setOnboarded(true)} />
      </div>
    </div>
  )

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)