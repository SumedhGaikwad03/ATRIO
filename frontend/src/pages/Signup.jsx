import { useState } from "react";
import { signup } from "../features/auth/services/authService";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value }); // wht have we used this here

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const filled = [form.username, form.email, form.password].filter(v => v.trim()).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .atrio-signup * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        /* ── PAGE ── */
        .atrio-signup {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fff7ed 65%, #ffedd5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* ── BLOBS ── */
        @keyframes blob1 {
          0%,100% { transform: translate(0,0) scale(1) rotate(0deg); }
          25%      { transform: translate(60px,-80px) scale(1.1) rotate(8deg); }
          50%      { transform: translate(-40px,60px) scale(0.95) rotate(-5deg); }
          75%      { transform: translate(80px,40px) scale(1.05) rotate(12deg); }
        }
        @keyframes blob2 {
          0%,100% { transform: translate(0,0) scale(1) rotate(0deg); }
          20%      { transform: translate(-70px,50px) scale(1.08) rotate(-10deg); }
          50%      { transform: translate(50px,-70px) scale(0.92) rotate(6deg); }
          80%      { transform: translate(-30px,-40px) scale(1.12) rotate(-8deg); }
        }
        @keyframes blob3 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,80px) scale(1.15); }
          66%      { transform: translate(-60px,-30px) scale(0.88); }
        }
        @keyframes blob4 {
          0%,100% { transform: translate(0,0) scale(1) rotate(0deg); }
          30%      { transform: translate(-50px,60px) scale(1.1) rotate(15deg); }
          60%      { transform: translate(70px,-50px) scale(0.9) rotate(-12deg); }
        }

        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(70px); pointer-events: none;
        }
        .blob-1 { width:500px; height:500px; background:rgba(251,191,36,0.45); top:-120px; left:-120px; animation:blob1 12s ease-in-out infinite; }
        .blob-2 { width:550px; height:550px; background:rgba(249,115,22,0.35); bottom:-150px; right:-150px; animation:blob2 15s ease-in-out infinite; }
        .blob-3 { width:400px; height:400px; background:rgba(253,224,71,0.4); top:40%; left:55%; animation:blob3 10s ease-in-out infinite; }
        .blob-4 { width:320px; height:320px; background:rgba(234,88,12,0.28); top:20%; right:10%; animation:blob4 18s ease-in-out infinite; }
        .blob-5 { width:280px; height:280px; background:rgba(251,191,36,0.3); bottom:10%; left:15%; animation:blob1 14s ease-in-out infinite reverse; }

        /* ── SHAPES ── */
        @keyframes drift1 { 0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-35px) rotate(12deg);} }
        @keyframes drift2 { 0%,100%{transform:translateY(0) translateX(0);}33%{transform:translateY(25px) translateX(20px);}66%{transform:translateY(-20px) translateX(-15px);} }
        @keyframes drift3 { 0%,100%{transform:translateY(0) rotate(45deg);}50%{transform:translateY(-28px) rotate(75deg);} }
        @keyframes drift4 { 0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.15) rotate(20deg);} }
        @keyframes drift5 { 0%,100%{transform:translateX(0) rotate(0deg);}50%{transform:translateX(30px) rotate(-15deg);} }
        @keyframes floatC { 0%,100%{transform:translateY(0) scale(1);opacity:0.6;}50%{transform:translateY(-22px) scale(1.08);opacity:0.9;} }

        .shape { position:absolute; pointer-events:none; }
        .sq1{width:64px;height:64px;background:rgba(255,255,255,0.45);border:1.5px solid rgba(255,255,255,0.7);border-radius:16px;top:12%;left:8%;backdrop-filter:blur(4px);animation:drift1 7s ease-in-out infinite;}
        .sq2{width:44px;height:44px;background:rgba(251,191,36,0.3);border:1.5px solid rgba(251,191,36,0.5);border-radius:12px;bottom:22%;right:8%;animation:drift2 9s ease-in-out infinite;}
        .sq3{width:80px;height:80px;background:rgba(255,255,255,0.3);border:1.5px solid rgba(255,255,255,0.6);border-radius:20px;top:65%;left:5%;backdrop-filter:blur(3px);animation:drift3 11s ease-in-out infinite;transform:rotate(45deg);}
        .sq4{width:36px;height:36px;background:rgba(249,115,22,0.2);border:1.5px solid rgba(249,115,22,0.4);border-radius:10px;top:8%;right:18%;animation:drift5 8s ease-in-out infinite;}
        .sq5{width:56px;height:56px;background:rgba(255,255,255,0.35);border:1.5px solid rgba(255,255,255,0.65);border-radius:14px;bottom:8%;left:40%;backdrop-filter:blur(4px);animation:drift2 13s ease-in-out infinite reverse;}
        .sq6{width:28px;height:28px;background:rgba(253,224,71,0.4);border:1.5px solid rgba(253,224,71,0.6);border-radius:8px;top:45%;left:3%;animation:drift4 6s ease-in-out infinite;}
        .c1{width:18px;height:18px;background:rgba(249,115,22,0.5);border-radius:50%;top:30%;right:5%;animation:floatC 5s ease-in-out infinite;}
        .c2{width:12px;height:12px;background:rgba(251,191,36,0.6);border-radius:50%;top:75%;right:22%;animation:floatC 7s ease-in-out infinite 1s;}
        .c3{width:22px;height:22px;background:rgba(255,255,255,0.55);border:1.5px solid rgba(255,255,255,0.8);border-radius:50%;top:18%;left:30%;animation:floatC 6s ease-in-out infinite 0.5s;}
        .c4{width:10px;height:10px;background:rgba(234,88,12,0.45);border-radius:50%;bottom:30%;left:25%;animation:floatC 4s ease-in-out infinite 2s;}

        /* ── WRAPPER ── */
        .signup-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: wrapIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes wrapIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── ABOVE CARD ── */
        .above-card {
          width: 100%;
          text-align: center;
          margin-bottom: 22px;
        }

        .logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-bottom: 14px;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .logo-mark {
          width: 52px; height: 52px; border-radius: 15px;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 5px 18px rgba(249,115,22,0.4);
        }
        .logo-mark span {
          font-family: 'Playfair Display', serif;
          font-weight: 800; font-size: 28px; color: white; line-height: 1;
        }
        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700;
          color: #1c1917; letter-spacing: -0.6px; line-height: 1;
        }
        .logo-name em { font-style: normal; color: #f97316; }

        .tagline {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 15px;
          color: #57534e;
          font-weight: 400;
          line-height: 1.6;
          margin-bottom: 14px;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.16s both;
        }

        .pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 7px;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.22s both;
        }
        .pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 99px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(251,191,36,0.5);
          font-size: 12px; font-weight: 500; color: #92400e;
          backdrop-filter: blur(6px);
          transition: background 0.15s;
        }
        .pill:hover { background: rgba(255,255,255,0.75); }
        .pill-dot { width:6px; height:6px; border-radius:50%; background:#f97316; flex-shrink:0; }

        /* ── GLASS CARD ── */
        .signup-card {
          width: 100%;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 8px 40px rgba(194,65,12,0.12),
            0 2px 8px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.95);
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.28s both;
        }

        .card-shine {
          height: 3px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #ea580c, #f97316, #fbbf24);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .card-body { padding: 32px 40px 40px; }

        .card-body > * {
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .card-body > *:nth-child(1) { animation-delay: 0.32s; }
        .card-body > *:nth-child(2) { animation-delay: 0.36s; }
        .card-body > *:nth-child(3) { animation-delay: 0.40s; }
        .card-body > *:nth-child(4) { animation-delay: 0.44s; }
        .card-body > *:nth-child(5) { animation-delay: 0.48s; }
        .card-body > *:nth-child(6) { animation-delay: 0.52s; }
        .card-body > *:nth-child(7) { animation-delay: 0.56s; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── FIELDS ── */
        .field { margin-bottom: 14px; }
        .field label {
          display: block; font-size: 11.5px; font-weight: 600;
          color: #92400e; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .field input {
          width: 100%; padding: 12px 15px;
          border: 1.5px solid #fde68a; border-radius: 13px;
          background: rgba(255,255,255,0.75);
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1c1917; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field input::placeholder { color: #a8a29e; }
        .field input:focus {
          border-color: #f97316;
          background: rgba(255,255,255,0.97);
          box-shadow: 0 0 0 4px rgba(249,115,22,0.11);
        }

        /* ── PROGRESS DOTS ── */
        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #fde68a;
          transition: background 0.3s, transform 0.3s;
        }
        .dot.active {
          background: #f97316;
          transform: scale(1.35);
        }

        /* ── ERROR ── */
        .signup-error {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 12px;
          background: rgba(254,226,226,0.8);
          border: 1px solid rgba(252,165,165,0.5);
          color: #dc2626; font-size: 13px; font-weight: 500;
          margin-bottom: 14px;
        }

        /* ── BUTTON ── */
        .signup-btn {
          width: 100%; padding: 13px; border-radius: 13px; border: none;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 14px rgba(234,88,12,0.35);
        }
        .signup-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(234,88,12,0.45);
        }
        .signup-btn:active:not(:disabled) { transform: scale(0.98); }
        .signup-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── FOOTER ── */
        .signup-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0 18px;
        }
        .signup-divider::before, .signup-divider::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(214,211,208,0.7), transparent);
        }
        .signup-divider span {
          font-size: 11px; color: #a8a29e;
          font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
        }

        .signup-footer { text-align: center; font-size: 13px; color: #78716c; }
        .signup-footer a {
          color: #f97316; font-weight: 600; cursor: pointer;
          border-bottom: 1px solid transparent; transition: border-color 0.15s;
        }
        .signup-footer a:hover { border-bottom-color: #f97316; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: spin 0.65s linear infinite;
          vertical-align: middle; margin-right: 7px;
        }
      `}</style>

      <div className="atrio-signup">

        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="blob blob-5" />

        {/* Shapes */}
        <div className="shape sq1" /><div className="shape sq2" />
        <div className="shape sq3" /><div className="shape sq4" />
        <div className="shape sq5" /><div className="shape sq6" />
        <div className="shape c1" /><div className="shape c2" />
        <div className="shape c3" /><div className="shape c4" />

        <div className="signup-wrap">

          {/* ── ABOVE CARD ── */}
          <div className="above-card">
            <div className="logo-row">
              <div className="logo-mark"><span>A</span></div>
              <div className="logo-name">Atri<em>o</em></div>
            </div>
            <p className="tagline">Where your team thinks out loud — together.</p>
            <div className="pills">
              <span className="pill"><span className="pill-dot" />Real-time rooms</span>
              <span className="pill"><span className="pill-dot" />Live collaboration</span>
              <span className="pill"><span className="pill-dot" />Shared notes</span>
            </div>
          </div>

          {/* ── GLASS CARD ── */}
          <div className="signup-card">
            <div className="card-shine" />
            <div className="card-body">

              <div className="field">
                <label>Username</label>
                <input
                  name="username" value={form.username}
                  onChange={handleChange} placeholder="yourname"
                  required autoComplete="username"
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  required autoComplete="email"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  name="password" type="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••"
                  required autoComplete="new-password"
                />
              </div>

              {/* Progress dots */}
              <div className="progress-dots">
                <div className={`dot ${filled >= 1 ? "active" : ""}`} />
                <div className={`dot ${filled >= 2 ? "active" : ""}`} />
                <div className={`dot ${filled >= 3 ? "active" : ""}`} />
              </div>

              {error && (
                <div className="signup-error">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <button className="signup-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" />Creating account…</> : "Create account →"}
              </button>

              <div className="signup-divider"><span>or</span></div>

              <div className="signup-footer">
                Already have an account?{" "}
                <a onClick={() => navigate("/login")}>Sign in</a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Signup;