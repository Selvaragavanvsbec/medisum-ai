import { Link } from "react-router-dom";
import { Icon, P } from "../icons.jsx";

export default function NotFound() {
  return (
    <div>
      <div className="aurora"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="grid-ov" />
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24, position: "relative", zIndex: 2 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 110, fontWeight: 700, lineHeight: 1 }} className="grad-text">404</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 600, margin: "12px 0 8px" }}>Page not found</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 24 }}>The page you're looking for doesn't exist or has moved.</p>
          <Link to="/" className="btn btn-primary">Back home<Icon d={P.arrow} /></Link>
        </div>
      </div>
    </div>
  );
}
