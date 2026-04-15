import { useState } from "react";
import { supabase } from "./lib/supabase";

const C = {
  bg: "#070B14", card: "#141C2E", card2: "#1A2540",
  teal: "#06D6A0", tealDark: "#05B384",
  purple: "#7B61FF", orange: "#FFB347",
  white: "#F7F8FC", text: "#C4CAD9", textMuted: "#6B7394",
  border: "#1E2A45", red: "#FF4D6D", green: "#22C55E",
};


export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0=auth, 1-5=questions, 6=done
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Questionnaire answers
  const [answers, setAnswers] = useState({
    anxiety_level: null,
    conversation_ease: null,
    social_difficulty: null,
    conversation_slowdown: null,
    approach_mindset: null,
    post_social: null,
    help_goal: null,
  });

  const totalSteps = 7;
  const progress = Math.round((step / totalSteps) * 100);

  const handleAuth = async () => {
  setLoading(true)
  setError("")
  try {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onComplete()
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          name,
          email,
        })
        setStep(1)
      }
    }
  } catch (e) {
    setError(e.message)
  }
  setLoading(false)
}

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Not logged in")
      await supabase.from("profiles").update(answers).eq("id", session.user.id)
      onComplete();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const Btn = ({ label, active, onClick, small }) => (
    <button onClick={onClick} style={{
      padding: small ? "10px 16px" : "14px 20px",
      borderRadius: 12,
      border: `1px solid ${active ? C.teal : C.border}`,
      background: active ? `${C.teal}18` : "transparent",
      color: active ? C.teal : C.textMuted,
      fontSize: small ? 13 : 15,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all .15s",
      fontFamily: "inherit",
    }}>{label}</button>
  );

  const Next = ({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: 18, borderRadius: 16,
      background: disabled ? C.border : `linear-gradient(135deg,${C.teal},${C.tealDark})`,
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 18, fontWeight: 700,
      color: disabled ? C.textMuted : C.bg,
      marginTop: 24, fontFamily: "inherit",
    }}>Continue →</button>
  );

  const Label = ({ children }) => (
    <div style={{ fontSize: 25, fontWeight: 800, color: C.white, marginBottom: 10, lineHeight: 1.3 }}>{children}</div>
  );
  const Sub = ({ children }) => (
    <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>{children}</div>
  );

  // ── Step 0: Auth ──
  if (step === 0) return (
    <Screen>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="emoji" style={{ fontSize: 32 }}>🧠</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.white, marginTop: 8 }}>SocialSense AI</div>
        <div style={{ fontSize: 15, color: C.textMuted, marginTop: 4 }}>Build real social confidence</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Sign Up", "Log In"].map((l, i) => (
          <button key={l} onClick={() => setIsLogin(i === 1)} style={{
            flex: 1, padding: 12, borderRadius: 12, fontFamily: "inherit",
            background: isLogin === (i === 1) ? `${C.teal}18` : "transparent",
            border: `1px solid ${isLogin === (i === 1) ? C.teal : C.border}`,
            color: isLogin === (i === 1) ? C.teal : C.textMuted,
            fontSize: 16, fontWeight: 700, cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      {!isLogin && <Input label="Your Name" value={name} onChange={setName} placeholder="Aaron" />}
      <Input label="Email" value={email} onChange={setEmail} placeholder="you@morgan.edu" type="email" />
      <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</div>}

      <button onClick={handleAuth} disabled={loading} style={{
        width: "100%", padding: 18, borderRadius: 16, marginTop: 20,
        background: `linear-gradient(135deg,${C.teal},${C.tealDark})`,
        border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700,
        color: C.bg, fontFamily: "inherit",
      }}>{loading ? "Loading..." : isLogin ? "Log In" : "Create Account"}</button>
    </Screen>
  );

  // ── Step 1: How do you feel in social settings? ──
  if (step === 1) return (
    <Screen progress={progress}>
      <Label>How do you feel in social settings?</Label>
      <Sub>Pick the one that feels most like you.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I feel overwhelmed in most social settings",
          "I often feel uncomfortable or anxious",
          "It depends on the situation",
          "I usually feel comfortable",
          "I feel confident in most social settings",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.anxiety_level === o}
            onClick={() => setAnswers(p => ({ ...p, anxiety_level: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(2)} disabled={!answers.anxiety_level} />
    </Screen>
  );

  // ── Step 2: Starting conversations ──
  if (step === 2) return (
    <Screen progress={progress}>
      <Label>How easy is it for you to start a conversation with someone new?</Label>
      <Sub>Pick the one that feels most like you.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I usually avoid it",
          "It feels really difficult",
          "It depends on the setting",
          "I can usually do it",
          "I enjoy meeting new people",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.conversation_ease === o}
            onClick={() => setAnswers(p => ({ ...p, conversation_ease: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(3)} disabled={!answers.conversation_ease} />
    </Screen>
  );

  // ── Step 3: What makes social situations hard ──
  if (step === 3) return (
    <Screen progress={progress}>
      <Label>What tends to make social situations hardest for you?</Label>
      <Sub>No judgment — just context for your coach.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I worry about being judged",
          "I never know what to say",
          "I feel anxious or overwhelmed",
          "I struggle to read the vibe",
          "Social situations usually feel fine",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.social_difficulty === o}
            onClick={() => setAnswers(p => ({ ...p, social_difficulty: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(4)} disabled={!answers.social_difficulty} />
    </Screen>
  );

  // ── Step 4: When conversation slows down ──
  if (step === 4) return (
    <Screen progress={progress}>
      <Label>When a conversation starts slowing down, how do you usually feel?</Label>
      <Sub>Be honest — there's no wrong answer here.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I panic and want to leave",
          "I get nervous and freeze up",
          "I try, but it feels awkward",
          "I can usually recover",
          "I stay relaxed and keep it going",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.conversation_slowdown === o}
            onClick={() => setAnswers(p => ({ ...p, conversation_slowdown: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(5)} disabled={!answers.conversation_slowdown} />
    </Screen>
  );

  // ── Step 5: Mindset before approaching ──
  if (step === 5) return (
    <Screen progress={progress}>
      <Label>Before approaching someone, what's your typical mindset?</Label>
      <Sub>Think about the last time you wanted to talk to someone new.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I talk myself out of it",
          "I overthink everything",
          "I hesitate, but sometimes push through",
          "I feel a little nervous but go for it",
          "I feel confident approaching people",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.approach_mindset === o}
            onClick={() => setAnswers(p => ({ ...p, approach_mindset: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(6)} disabled={!answers.approach_mindset} />
    </Screen>
  );

  // ── Step 6: After social interactions ──
  if (step === 6) return (
    <Screen progress={progress}>
      <Label>After social interactions, what usually happens?</Label>
      <Sub>Pick what feels most familiar.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "I replay everything and feel embarrassed",
          "I second guess what I said",
          "I think about it for a while",
          "I move on pretty quickly",
          "I usually feel good afterward",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.post_social === o}
            onClick={() => setAnswers(p => ({ ...p, post_social: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(7)} disabled={!answers.post_social} />
    </Screen>
  );

  // ── Step 7: What would you like help with ──
  if (step === 7) return (
    <Screen progress={progress}>
      <Label>What would you most like SocialSense to help you with?</Label>
      <Sub>This shapes everything your coach focuses on.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "Starting conversations more easily",
          "Feeling calmer in the moment",
          "Knowing what to say next",
          "Reading social cues better",
          "Building long-term confidence",
        ].map(o => (
          <OptionRow key={o} label={o} active={answers.help_goal === o}
            onClick={() => setAnswers(p => ({ ...p, help_goal: o }))} />
        ))}
      </div>

      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</div>}

      <button onClick={handleFinish} disabled={loading || !answers.help_goal} style={{
        width: "100%", padding: 18, borderRadius: 16, marginTop: 24,
        background: !answers.help_goal ? C.border : `linear-gradient(135deg,${C.teal},${C.tealDark})`,
        border: "none", cursor: !answers.help_goal ? "not-allowed" : "pointer",
        fontSize: 18, fontWeight: 700,
        color: !answers.help_goal ? C.textMuted : C.bg, fontFamily: "inherit",
      }}>{loading ? "Saving..." : "Let's Go"}</button>
    </Screen>
  );

  return null;
}

// ── Reusable sub-components ──

function Screen({ children, progress }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, padding: "62px 14px 32px",
      fontFamily: "'DM Sans',-apple-system,sans-serif", color: C.white,
      maxWidth: 480, margin: "0 auto",
    }}>
      {progress !== undefined && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>SETUP</span>
            <span style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: C.border }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.teal},${C.purple})`, transition: "width .4s" }} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function OptionRow({ label, active, onClick, checkbox }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "17px 16px", borderRadius: 14,
      border: `1px solid ${active ? C.teal : C.border}`,
      background: active ? `${C.teal}10` : "transparent",
      cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: checkbox ? 6 : 11,
        border: `2px solid ${active ? C.teal : C.border}`,
        background: active ? C.teal : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all .15s",
      }}>
        {active && <span style={{ fontSize: 13, color: C.bg, fontWeight: 800 }}>✓</span>}
      </div>
      <span style={{ fontSize: 15, color: active ? C.white : C.text, fontWeight: active ? 600 : 400 }}>{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{
          width: "100%", padding: "16px 16px", borderRadius: 14,
          background: C.card, border: `1px solid ${C.border}`,
          color: C.white, fontSize: 16, outline: "none",
          fontFamily: "inherit", boxSizing: "border-box",
        }} />
    </div>
  );
}