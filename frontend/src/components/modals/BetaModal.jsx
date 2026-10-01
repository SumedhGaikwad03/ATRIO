import { AnimatePresence, motion } from "framer-motion";

function BetaModal({ show, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              width: "100%",
              maxWidth: "440px",
              borderRadius: "24px",
              overflow: "hidden",
              background: "rgba(255,253,245,0.98)",
              border: "1px solid rgba(253,230,138,0.6)",
              boxShadow: "0 24px 64px rgba(194,65,12,0.15)",
            }}
          >
            {/* Shimmer stripe */}
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)",
                backgroundSize: "200% auto",
                animation: "shimmer 3s linear infinite",
              }}
            />

            <div style={{ padding: "32px" }}>
              {/* Title row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#92400e",
                      marginBottom: "4px",
                    }}
                  >
                    Welcome to Atrio
                  </h2>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#f97316",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Early Access
                  </p>
                </div>
                <span
                  onClick={onClose}
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "3px 8px",
                    borderRadius: "99px",
                    background: "#f97316",
                    color: "white",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  BETA
                </span>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "#57534e",
                  lineHeight: 1.7,
                  marginBottom: "10px",
                }}
              >
                You're using an early version of Atrio. Create rooms,
                collaborate in real‑time, and manage notes together inside
                shared spaces.
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a8a29e",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                }}
              >
                We're actively improving the experience. If something feels off,
                that insight helps shape the product.
              </p>

              {/* Contact box */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#fef9e7",
                  border: "1px solid #fde68a",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#92400e",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Feedback & suggestions
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <a
                    href="mailto:SumedhGaikwad.dev@gmail.com"
                    style={{
                      fontSize: "12px",
                      color: "#a8a29e",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#f97316")}
                    onMouseLeave={(e) => (e.target.style.color = "#a8a29e")}
                  >
                    ✉ SumedhGaikwad.dev@gmail.com
                  </a>
                  <a
                    href="https://www.linkedin.com/in/sumedh-gaikwad-8b95292a6"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#a8a29e",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#f97316")}
                    onMouseLeave={(e) => (e.target.style.color = "#a8a29e")}
                  >
                    🔗 LinkedIn
                  </a>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onConfirm}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "13px",
                  border: "none",
                  background: "linear-gradient(135deg,#f97316,#ea580c)",
                  color: "white",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(234,88,12,0.3)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(234,88,12,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(234,88,12,0.3)";
                }}
              >
                Got it, let's go →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BetaModal;
