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
      {/* iPhone 15 Pro frame */}
      <div style={{ position: "relative", width: 393, flexShrink: 0 }}>
        {/* Silent switch */}
        <div style={{ position: "absolute", left: -3, top: 120, width: 3, height: 32, background: "#3a3a3c", borderRadius: "3px 0 0 3px" }} />
        {/* Volume up */}
        <div style={{ position: "absolute", left: -3, top: 172, width: 3, height: 60, background: "#3a3a3c", borderRadius: "3px 0 0 3px" }} />
        {/* Volume down */}
        <div style={{ position: "absolute", left: -3, top: 244, width: 3, height: 60, background: "#3a3a3c", borderRadius: "3px 0 0 3px" }} />
        {/* Power button */}
        <div style={{ position: "absolute", right: -3, top: 192, width: 3, height: 80, background: "#3a3a3c", borderRadius: "0 3px 3px 0" }} />

        {/* Outer frame */}
        <div style={{
          width: 393, height: 852,
          background: "linear-gradient(145deg, #2a2a2c, #1c1c1e)",
          borderRadius: 54,
          padding: 10,
          boxShadow: "0 0 0 1px #4a4a4c, 0 40px 120px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.08)",
        }}>
          {/* Screen */}
          <div style={{ width: "100%", height: "100%", background: "#070B14", borderRadius: 46, overflow: "hidden", position: "relative" }}>
            {/* Dynamic Island */}
            <div style={{
              position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
              width: 120, height: 34, background: "#000", borderRadius: 20, zIndex: 50,
              boxShadow: "0 0 0 1px rgba(255,255,255,.06)",
            }} />
            {/* Content */}
            <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <Onboarding onComplete={() => setOnboarded(true)} />
            </div>
          </div>
        </div>
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