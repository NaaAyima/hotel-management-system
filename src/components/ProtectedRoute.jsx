import { Navigate } from "react-router-dom"

// Define role-based permissions
const rolePermissions = {
  Admin: ["dashboard", "rooms", "check-in", "check-out", "booking", "guests", "reports", "room-status", "payments"],
  Receptionist: ["dashboard", "rooms", "check-in", "check-out", "booking", "guests", "room-status"],
  Manager: ["dashboard", "rooms", "guests", "reports", "payments"]
}

function ProtectedRoute({ children, requiredPage }) {
  // Check if user is logged in
  const userSession = localStorage.getItem("hotelUser")
  
  if (!userSession) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />
  }

  const user = JSON.parse(userSession)
  
  // Check if user's role has permission for this page
  if (requiredPage && rolePermissions[user.role]) {
    const hasPermission = rolePermissions[user.role].includes(requiredPage)
    
    if (!hasPermission) {
      // No permission, redirect to dashboard with error message
      alert(`Access Denied: ${user.role} role does not have permission to access this page.`)
      return <Navigate to="/dashboard" replace />
    }
  }

  // User is logged in and has permission
  return children
}

export default ProtectedRoute
