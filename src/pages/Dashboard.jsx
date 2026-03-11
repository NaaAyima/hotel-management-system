import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { dashboardAPI } from "../services/api"
import "../index.css"

function Dashboard() {
  const navigate = useNavigate()
  
  // Get logged in user info
  const userSession = JSON.parse(localStorage.getItem("hotelUser") || "{}")
  
  // State for dashboard stats
  const [stats, setStats] = useState([
    { title: "Total Rooms", value: "-", icon: "🏨" },
    { title: "Available Rooms", value: "-", icon: "✅" },
    { title: "Occupied Rooms", value: "-", icon: "🔒" },
    { title: "Reserved Rooms", value: "-", icon: "📅" },
    { title: "Rooms in Cleaning", value: "-", icon: "🧹" },
    { title: "Checkouts Due Today", value: "-", icon: "⏰" },
  ])
  const [loading, setLoading] = useState(true)
  
  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats()
        
        setStats([
          { title: "Total Rooms", value: data.totalRooms.toString(), icon: "🏨" },
          { title: "Available Rooms", value: data.availableRooms.toString(), icon: "✅" },
          { title: "Occupied Rooms", value: data.occupiedRooms.toString(), icon: "🔒" },
          { title: "Reserved Rooms", value: data.reservedRooms.toString(), icon: "📅" },
          { title: "Rooms in Cleaning", value: data.cleaningRooms.toString(), icon: "🧹" },
          { title: "Checkouts Due Today", value: data.checkoutsToday.toString(), icon: "⏰" },
        ])
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        alert("Failed to load dashboard data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  // Handle logout
  const handleLogout = () => {
    const confirm = window.confirm("Are you sure you want to logout?")
    if (confirm) {
      localStorage.removeItem("hotelUser")
      navigate("/")
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>J.J.O.J Guest House</h1>
          <p style={styles.subtitle}>Welcome back{userSession.name ? `, ${userSession.name}` : ""}! Here's what's happening today.</p>
        </div>
        <div style={styles.headerActions}>
          {userSession.role && (
            <span style={styles.roleBadge}>{userSession.role}</span>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {loading ? (
          <div style={styles.loadingMessage}>Loading dashboard statistics...</div>
        ) : (
          stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statValue}>{stat.value}</h3>
                <p style={styles.statTitle}>{stat.title}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {/* Rooms - All roles */}
          <Link to="/rooms" style={styles.actionCard}>
            <span style={styles.actionIcon}>🛏️</span>
            <h3 style={styles.actionTitle}>Manage Rooms</h3>
            <p style={styles.actionDesc}>View and edit room availability</p>
          </Link>
          
          {/* Booking - Admin & Receptionist only */}
          {(userSession.role === "Admin" || userSession.role === "Receptionist") && (
            <Link to="/booking" style={styles.actionCard}>
              <span style={styles.actionIcon}>📝</span>
              <h3 style={styles.actionTitle}>New Reservation</h3>
              <p style={styles.actionDesc}>Book room for future dates</p>
            </Link>
          )}
          
          {/* Check-In - Admin & Receptionist only */}
          {(userSession.role === "Admin" || userSession.role === "Receptionist") && (
            <Link to="/check-in" style={styles.actionCard}>
              <span style={styles.actionIcon}>🚪</span>
              <h3 style={styles.actionTitle}>Check-In Guest</h3>
              <p style={styles.actionDesc}>Register new guest arrival</p>
            </Link>
          )}
          
          {/* Check-Out - Admin & Receptionist only */}
          {(userSession.role === "Admin" || userSession.role === "Receptionist") && (
            <Link to="/check-out" style={styles.actionCard}>
              <span style={styles.actionIcon}>📊</span>
              <h3 style={styles.actionTitle}>Check-Out Guest</h3>
              <p style={styles.actionDesc}>Process guest departure</p>
            </Link>
          )}
          
          {/* Guest Management - All roles */}
          <Link to="/guests" style={styles.actionCard}>
            <span style={styles.actionIcon}>👤</span>
            <h3 style={styles.actionTitle}>Guest Management</h3>
            <p style={styles.actionDesc}>View all guest records</p>
          </Link>
          
          {/* Reports - Admin & Manager only */}
          {(userSession.role === "Admin" || userSession.role === "Manager") && (
            <Link to="/reports" style={styles.actionCard}>
              <span style={styles.actionIcon}>📈</span>
              <h3 style={styles.actionTitle}>Reports & Analytics</h3>
              <p style={styles.actionDesc}>View revenue and performance</p>
            </Link>
          )}
          
          {/* Room Status - Admin & Receptionist only */}
          {(userSession.role === "Admin" || userSession.role === "Receptionist") && (
            <Link to="/room-status" style={styles.actionCard}>
              <span style={styles.actionIcon}>🧹</span>
              <h3 style={styles.actionTitle}>Room Status</h3>
              <p style={styles.actionDesc}>Manage housekeeping & maintenance</p>
            </Link>
          )}
          
          {/* Payments - Admin & Manager only */}
          {(userSession.role === "Admin" || userSession.role === "Manager") && (
            <Link to="/payments" style={styles.actionCard}>
              <span style={styles.actionIcon}>💳</span>
              <h3 style={styles.actionTitle}>Payment History</h3>
              <p style={styles.actionDesc}>View all transactions</p>
            </Link>
          )}
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div style={styles.alertsSection}>
        <h2 style={styles.sectionTitle}>⚠️ Alerts & Notifications</h2>
        <div style={styles.alertsList}>
          <div style={{...styles.alertItem, ...styles.alertWarning}}>
            <span style={styles.alertIcon}>⏰</span>
            <div style={styles.alertContent}>
              <p style={styles.alertText}>Room 7 checkout is due at 12:00 PM today</p>
              <span style={styles.alertTime}>Today, 12:00 PM</span>
            </div>
          </div>
          <div style={{...styles.alertItem, ...styles.alertWarning}}>
            <span style={styles.alertIcon}>⏰</span>
            <div style={styles.alertContent}>
              <p style={styles.alertText}>Room 12 checkout is due at 11:00 AM today</p>
              <span style={styles.alertTime}>Today, 11:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activitySection}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <div style={styles.activityList}>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>✅</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>Room 5 is being cleaned after checkout</p>
              <span style={styles.activityTime}>10 minutes ago</span>
            </div>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>🔔</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>New booking for Room 3</p>
              <span style={styles.activityTime}>1 hour ago</span>
            </div>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>🔒</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>Room 2 checked in - Guest: John Doe</p>
              <span style={styles.activityTime}>2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "100%",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  roleBadge: {
    padding: "0.5rem 1rem",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "0.625rem 1.25rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  statIcon: {
    fontSize: "2.5rem",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: 0,
  },
  statTitle: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "0.25rem 0 0 0",
  },
  actionsSection: {
    marginBottom: "3rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
  },
  actionCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
  },
  actionIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "1rem",
  },
  actionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  actionDesc: {
    fontSize: "0.9rem",
    color: "#666",
    margin: 0,
  },
  activitySection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  activityIcon: {
    fontSize: "1.5rem",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: "0.95rem",
    color: "#1a1a1a",
    margin: "0 0 0.25rem 0",
  },
  activityTime: {
    fontSize: "0.8rem",
    color: "#999",
  },
  alertsSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "3rem",
  },
  alertsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  alertItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid",
  },
  alertWarning: {
    backgroundColor: "#fef3c7",
    borderLeftColor: "#f59e0b",
  },
  alertIcon: {
    fontSize: "1.5rem",
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: "0.95rem",
    color: "#1a1a1a",
    fontWeight: "500",
    margin: "0 0 0.25rem 0",
  },
  alertTime: {
    fontSize: "0.8rem",
    color: "#78716c",
  },
  loadingMessage: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    fontSize: "1rem",
    color: "#666",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}

export default Dashboard
