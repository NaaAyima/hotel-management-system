import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Rooms from "./pages/Rooms"
import CheckIn from "./pages/CheckIn"
import CheckOut from "./pages/CheckOut"
import Booking from "./pages/Booking"
import Guests from "./pages/Guests"
import Reports from "./pages/Reports"
import RoomStatus from "./pages/RoomStatus"
import Payments from "./pages/Payments"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredPage="dashboard">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute requiredPage="rooms">
            <Rooms />
          </ProtectedRoute>
        } />
        <Route path="/check-in" element={
          <ProtectedRoute requiredPage="check-in">
            <CheckIn />
          </ProtectedRoute>
        } />
        <Route path="/check-out" element={
          <ProtectedRoute requiredPage="check-out">
            <CheckOut />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute requiredPage="booking">
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/guests" element={
          <ProtectedRoute requiredPage="guests">
            <Guests />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute requiredPage="reports">
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/room-status" element={
          <ProtectedRoute requiredPage="room-status">
            <RoomStatus />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute requiredPage="payments">
            <Payments />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App