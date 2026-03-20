import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authAPI } from "../services/api"
import "../index.css"

function Signup() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "Receptionist"
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Call backend API for registration
      const response = await authAPI.register(formData)
      
      // Auto-login or redirect to login
      alert(`Account created successfully! Welcome, ${response.data.name}. Please sign in.`)
      
      // Navigate to login
      navigate("/")
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.")
      console.error("Signup error:", err)
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
          <p style={styles.subtitle}>Create a new employee account</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBanner}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter full name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter email address"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Choose a username"
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
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ fontSize: "0.95rem", color: "#4b5563", marginTop: "1rem" }}>
            Already have an account? <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Sign in</Link>
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
    maxWidth: "500px",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logo: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
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
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "white",
    color: "#000000",
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
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.85rem",
    color: "#9ca3af",
    marginTop: "1.5rem",
  },
}

export default Signup
