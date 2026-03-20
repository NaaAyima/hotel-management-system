import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authAPI } from "../services/api"
import "../index.css"

function Login() {
  const navigate = useNavigate()
  


  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!formData.username.trim()) {
      setError("Username is required")
      return
    }
    
    if (!formData.password.trim()) {
      setError("Password is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Call backend API for authentication
      const response = await authAPI.login(formData.username, formData.password)
      
      // Store user info with JWT token in localStorage
      const userSession = {
        username: response.user.username,
        role: response.user.role,
        name: response.user.name,
        token: response.token,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem("hotelUser", JSON.stringify(userSession))
      
      // Show success message
      alert(`Welcome, ${response.user.name}!\n\nRole: ${response.user.role}\nLogin successful.`)
      
      // Navigate to dashboard
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🏨</div>
          <h1 style={styles.title}>J.J.O.J Guest House</h1>
          <p style={styles.subtitle}>Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBanner}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div style={styles.rememberSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Remember me</span>
            </label>
          </div>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>



        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ fontSize: "0.95rem", color: "#4b5563" }}>
            Don't have an account? <Link to="/signup" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Sign up here</Link>
          </p>
          <p style={styles.footerText}>
            © 2026 J.J.O.J Guest House. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f8",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "2rem",
  },
  loginBox: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "3rem",
    width: "100%",
    maxWidth: "480px",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logo: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  errorBanner: {
    padding: "0.875rem",
    backgroundColor: "#fee2e2",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    color: "#991b1b",
    fontSize: "0.95rem",
    fontWeight: "600",
    textAlign: "center",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    padding: "0.875rem",
    fontSize: "1rem",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "white",
    color: "#000000",
  },
  rememberSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  checkboxText: {
    fontSize: "0.95rem",
    color: "#374151",
    fontWeight: "500",
  },
  loginButton: {
    padding: "0.875rem",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "0.5rem",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "2rem 0",
    textAlign: "center",
  },
  dividerText: {
    flex: 1,
    fontSize: "0.85rem",
    color: "#9ca3af",
    fontWeight: "600",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      height: "1px",
      backgroundColor: "#e5e7eb",
    }
  },
  demoSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "2px solid #e5e7eb",
  },
  demoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  demoTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
  },
  toggleButton: {
    padding: "0.375rem 0.875rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "2px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  demoCredentials: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  demoInfo: {
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: "0 0 0.5rem 0",
    fontWeight: "500",
  },
  credentialCard: {
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  credentialInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  credentialRole: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "0.25rem",
  },
  credentialDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  credentialLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  credentialValue: {
    color: "#000000",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  quickLoginButton: {
    padding: "0.625rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#059669",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  footer: {
    marginTop: "2rem",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.85rem",
    color: "#9ca3af",
    margin: 0,
  },
}

export default Login
