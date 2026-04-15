import { useState } from "react";
import { supabase } from "./lib/supabase";

const C = {
  bg: "#070B14", card: "#141C2E", card2: "#1A2540",
  teal: "#06D6A0", tealDark: "#05B384",
  purple: "#7B61FF", orange: "#FFB347",
  white: "#F7F8FC", text: "#C4CAD9", textMuted: "#6B7394",
  border: "#1E2A45", red: "#FF4D6D", green: "#22C55E",
};

const INTERESTS = [
  "Entrepreneurship","Leadership","Podcasts","Basketball",
  "Cooking","Tech","Music","Art","Travel","Fitness",
  "Fashion","Gaming","Film","Faith","Mental Health","Career",
];

const BLOCKERS = [
  "I don't know what to say",
  "I'm scared of being judged",
  "I get nervous and freeze",
  "I overthink after the fact",
  "I can start but can't keep it going",
  "Nothing really, I'm just here to improve",
];

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
    conversation_start_freq: null,
    post_social_feeling: null,
    friend_difficulty: null,
    close_friend_count: null,
    blockers: [],
    interests: [],
    goal: null,
    major: "",
    gender: null,
  });

  const totalSteps = 6;
  const progress = Math.round((step / totalSteps) * 100);

  const toggle = (field, val) => {
    setAnswers(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
      };
    });
  };

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
      padding: small ? "8px 14px" : "12px 18px",
      borderRadius: 12,
      border: `1px solid ${active ? C.teal : C.border}`,
      background: active ? `${C.teal}18` : "transparent",
      color: active ? C.teal : C.textMuted,
      fontSize: small ? 12 : 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all .15s",
      fontFamily: "inherit",
    }}>{label}</button>
  );

  const Next = ({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: 16, borderRadius: 16,
      background: disabled ? C.border : `linear-gradient(135deg,${C.teal},${C.tealDark})`,
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 16, fontWeight: 700,
      color: disabled ? C.textMuted : C.bg,
      marginTop: 24, fontFamily: "inherit",
    }}>Continue →</button>
  );

  const Label = ({ children }) => (
    <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 8, lineHeight: 1.3 }}>{children}</div>
  );
  const Sub = ({ children }) => (
    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>{children}</div>
  );

  // ── Step 0: Auth ──
  if (step === 0) return (
    <Screen>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 32 }}>🧠</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.white, marginTop: 8 }}>SocialSense AI</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Build real social confidence</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Sign Up", "Log In"].map((l, i) => (
          <button key={l} onClick={() => setIsLogin(i === 1)} style={{
            flex: 1, padding: 12, borderRadius: 12, fontFamily: "inherit",
            background: isLogin === (i === 1) ? `${C.teal}18` : "transparent",
            border: `1px solid ${isLogin === (i === 1) ? C.teal : C.border}`,
            color: isLogin === (i === 1) ? C.teal : C.textMuted,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      {!isLogin && <Input label="Your Name" value={name} onChange={setName} placeholder="Aaron" />}
      <Input label="Email" value={email} onChange={setEmail} placeholder="you@morgan.edu" type="email" />
      <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</div>}

      <button onClick={handleAuth} disabled={loading} style={{
        width: "100%", padding: 16, borderRadius: 16, marginTop: 20,
        background: `linear-gradient(135deg,${C.teal},${C.tealDark})`,
        border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700,
        color: C.bg, fontFamily: "inherit",
      }}>{loading ? "Loading..." : isLogin ? "Log In" : "Create Account"}</button>
    </Screen>
  );

  // ── Step 1: Social comfort ──
  if (step === 1) return (
    <Screen progress={progress}>
      <Label>How do you feel in social settings?</Label>
      <Sub>Be honest — this helps us personalize your experience.</Sub>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {[
          { e: "😰", l: "Very uncomfortable", v: 1 },
          { e: "😕", l: "Uncomfortable", v: 2 },
          { e: "😐", l: "Neutral", v: 3 },
          { e: "🙂", l: "Comfortable", v: 4 },
          { e: "😄", l: "Very comfortable", v: 5 },
        ].map(m => (
          <button key={m.v} onClick={() => setAnswers(p => ({ ...p, anxiety_level: m.v }))} style={{
            flex: 1, padding: "12px 4px", borderRadius: 14, cursor: "pointer",
            border: `1px solid ${answers.anxiety_level === m.v ? C.teal : C.border}`,
            background: answers.anxiety_level === m.v ? `${C.teal}18` : "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            fontFamily: "inherit",
          }}>
            <span style={{ fontSize: 26 }}>{m.e}</span>
            <span style={{ fontSize: 9, color: answers.anxiety_level === m.v ? C.teal : C.textMuted, fontWeight: 600, textAlign: "center" }}>{m.l}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 12 }}>How often do you start conversations first?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Almost never", "Sometimes, if I know the person", "Sometimes with strangers too", "Pretty often", "All the time"].map(o => (
            <OptionRow key={o} label={o} active={answers.conversation_start_freq === o}
              onClick={() => setAnswers(p => ({ ...p, conversation_start_freq: o }))} />
          ))}
        </div>
      </div>
      <Next onClick={() => setStep(2)} disabled={!answers.anxiety_level || !answers.conversation_start_freq} />
    </Screen>
  );

  // ── Step 2: Friendship patterns ──
  if (step === 2) return (
    <Screen progress={progress}>
      <Label>How's your friendship game?</Label>
      <Sub>No judgment — just context for your coach.</Sub>

      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 10 }}>Do you have trouble making friends?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {["Yes, it's really hard for me", "Sometimes — I connect but it doesn't go deeper", "Making friends is fine, keeping them is harder", "Not really"].map(o => (
          <OptionRow key={o} label={o} active={answers.friend_difficulty === o}
            onClick={() => setAnswers(p => ({ ...p, friend_difficulty: o }))} />
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 10 }}>How many close friends do you have right now?</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["0", "1-2", "3-5", "5+"].map(o => (
          <Btn key={o} label={o} small active={answers.close_friend_count === o}
            onClick={() => setAnswers(p => ({ ...p, close_friend_count: o }))} />
        ))}
      </div>
      <Next onClick={() => setStep(3)} disabled={!answers.friend_difficulty || !answers.close_friend_count} />
    </Screen>
  );

  // ── Step 3: Blockers ──
  if (step === 3) return (
    <Screen progress={progress}>
      <Label>What gets in your way?</Label>
      <Sub>Pick up to 2 things that feel most true for you.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BLOCKERS.map(b => (
          <OptionRow key={b} label={b} active={answers.blockers.includes(b)}
            onClick={() => toggle("blockers", b)} checkbox />
        ))}
      </div>
      <Next onClick={() => setStep(4)} disabled={answers.blockers.length === 0} />
    </Screen>
  );

  // ── Step 4: Interests ──
  if (step === 4) return (
    <Screen progress={progress}>
      <Label>What are you into?</Label>
      <Sub>We use this to match you with people you'll actually vibe with.</Sub>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INTERESTS.map(i => (
          <button key={i} onClick={() => toggle("interests", i)} style={{
            padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            border: `1px solid ${answers.interests.includes(i) ? C.teal : C.border}`,
            background: answers.interests.includes(i) ? `${C.teal}18` : "transparent",
            color: answers.interests.includes(i) ? C.teal : C.textMuted,
          }}>{i}</button>
        ))}
      </div>
      <Next onClick={() => setStep(5)} disabled={answers.interests.length === 0} />
    </Screen>
  );

  // ── Step 5: About you ──
  if (step === 5) return (
    <Screen progress={progress}>
      <Label>Almost done 🎉</Label>
      <Sub>Just a little more info to complete your profile.</Sub>

      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 10 }}>What are you here to work on?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {["Meeting people on campus", "Getting better at small talk", "Building deeper friendships", "Networking / professional connections", "All of the above"].map(o => (
          <OptionRow key={o} label={o} active={answers.goal === o}
            onClick={() => setAnswers(p => ({ ...p, goal: o }))} />
        ))}
      </div>

      <Input label="What's your major / field?" value={answers.major}
        onChange={v => setAnswers(p => ({ ...p, major: v }))} placeholder="Business, Nursing, CS..." />

      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 10, marginTop: 16 }}>How do you identify?</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["Man", "Woman", "Non-binary", "Prefer not to say"].map(g => (
          <Btn key={g} label={g} small active={answers.gender === g}
            onClick={() => setAnswers(p => ({ ...p, gender: g }))} />
        ))}
      </div>

      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</div>}

      <button onClick={handleFinish} disabled={loading || !answers.goal} style={{
        width: "100%", padding: 16, borderRadius: 16, marginTop: 24,
        background: !answers.goal ? C.border : `linear-gradient(135deg,${C.teal},${C.tealDark})`,
        border: "none", cursor: !answers.goal ? "not-allowed" : "pointer",
        fontSize: 16, fontWeight: 700,
        color: !answers.goal ? C.textMuted : C.bg, fontFamily: "inherit",
      }}>{loading ? "Saving..." : "Let's Go 🚀"}</button>
    </Screen>
  );

  return null;
}

// ── Reusable sub-components ──

function Screen({ children, progress }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, padding: "64px 24px 32px",
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
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", borderRadius: 14,
      border: `1px solid ${active ? C.teal : C.border}`,
      background: active ? `${C.teal}10` : "transparent",
      cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: checkbox ? 6 : 10,
        border: `2px solid ${active ? C.teal : C.border}`,
        background: active ? C.teal : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all .15s",
      }}>
        {active && <span style={{ fontSize: 11, color: C.bg, fontWeight: 800 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: active ? C.white : C.text, fontWeight: active ? 600 : 400 }}>{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 14,
          background: C.card, border: `1px solid ${C.border}`,
          color: C.white, fontSize: 14, outline: "none",
          fontFamily: "inherit", boxSizing: "border-box",
        }} />
    </div>
  );
}