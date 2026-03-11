import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { roomsAPI, guestsAPI } from "../services/api"
import "../index.css"

function CheckIn() {
  const navigate = useNavigate()
  
  // Available rooms from API
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch available rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomsAPI.getAll({ status: 'Available' })
        // Transform API data to match component structure
        const rooms = data.rooms.map(room => ({
          number: room.roomNumber,
          type: room.type,
          price: room.pricePerNight,
          id: room.id
        }))
        setAvailableRooms(rooms)
      } catch (error) {
        console.error("Error fetching rooms:", error)
        alert("Failed to load available rooms. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const [formData, setFormData] = useState({
    guestName: "",
    phoneNumber: "",
    selectedRoom: "",
    numberOfNights: "",
    checkInDate: new Date().toISOString().slice(0, 16), // Current date and time
    checkOutDate: "",
    amountToPay: "",
    amountPaid: "",
    balance: "",
    paymentMethod: "Cash",
  })

  const [errors, setErrors] = useState({})

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-calculate checkout date when check-in date or nights change
      // Checkout is always at 12:00 PM (noon)
      if (name === "checkInDate" || name === "numberOfNights") {
        if (updated.checkInDate && updated.numberOfNights) {
          const checkIn = new Date(updated.checkInDate)
          checkIn.setDate(checkIn.getDate() + parseInt(updated.numberOfNights || 0))
          // Set checkout time to 12:00 PM (noon)
          checkIn.setHours(12, 0, 0, 0)
          updated.checkOutDate = checkIn.toISOString().slice(0, 16)
        }
      }

      // Auto-calculate amount to pay when room is selected
      if (name === "selectedRoom") {
        const room = availableRooms.find(r => r.number === value)
        if (room && updated.numberOfNights) {
          updated.amountToPay = (room.price * parseInt(updated.numberOfNights)).toString()
        }
      }

      // Auto-calculate amount when nights change
      if (name === "numberOfNights" && updated.selectedRoom) {
        const room = availableRooms.find(r => r.number === updated.selectedRoom)
        if (room) {
          updated.amountToPay = (room.price * parseInt(value || 0)).toString()
        }
      }

      // Auto-calculate balance
      if (name === "amountToPay" || name === "amountPaid") {
        const toPay = parseFloat(updated.amountToPay || 0)
        const paid = parseFloat(updated.amountPaid || 0)
        updated.balance = (toPay - paid).toFixed(2)
      }

      return updated
    })
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.guestName.trim()) newErrors.guestName = "Guest name is required"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (!formData.selectedRoom) newErrors.selectedRoom = "Please select a room"
    if (!formData.numberOfNights || formData.numberOfNights <= 0) {
      newErrors.numberOfNights = "Number of nights must be greater than 0"
    }
    if (!formData.checkInDate) newErrors.checkInDate = "Check-in date is required"
    if (!formData.amountPaid) newErrors.amountPaid = "Amount paid is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const selectedRoomData = availableRooms.find(r => r.number === formData.selectedRoom)
      
      const checkInData = {
        guestName: formData.guestName,
        guestPhone: formData.phoneNumber,
        roomId: selectedRoomData.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfNights: parseInt(formData.numberOfNights),
        totalAmount: parseFloat(formData.amountToPay),
        amountPaid: parseFloat(formData.amountPaid),
        balance: parseFloat(formData.balance),
        paymentMethod: formData.paymentMethod
      }

      await guestsAPI.checkIn(checkInData)
      
      alert(`Guest ${formData.guestName} successfully checked into Room ${formData.selectedRoom}!\n\nRoom status changed to OCCUPIED.`)
      
      navigate("/rooms")
    } catch (error) {
      console.error("Error checking in guest:", error)
      alert("Failed to check in guest. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Guest Check-In</h1>
          <p style={styles.subtitle}>Register a new guest and assign a room</p>
        </div>
      </header>

      {/* Check-in Form */}
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Guest Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Guest Information</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Guest Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  style={errors.guestName ? {...styles.input, ...styles.inputError} : styles.input}
                  placeholder="Enter guest full name"
                />
                {errors.guestName && <span style={styles.errorText}>{errors.guestName}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={errors.phoneNumber ? {...styles.input, ...styles.inputError} : styles.input}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <span style={styles.errorText}>{errors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          {/* Room & Stay Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Room & Stay Details</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Select Room <span style={styles.required}>*</span>
                </label>
                <select
                  name="selectedRoom"
                  value={formData.selectedRoom}
                  onChange={handleChange}
                  style={errors.selectedRoom ? {...styles.select, ...styles.inputError} : styles.select}
                  disabled={loading}
                >
                  <option value="">{loading ? "Loading rooms..." : "-- Select Available Room --"}</option>
                  {availableRooms.map(room => (
                    <option key={room.number} value={room.number}>
                      Room {room.number} - {room.type} (GHS {room.price}/night)
                    </option>
                  ))}
                </select>
                {errors.selectedRoom && <span style={styles.errorText}>{errors.selectedRoom}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Number of Nights <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="numberOfNights"
                  value={formData.numberOfNights}
                  onChange={handleChange}
                  min="1"
                  style={errors.numberOfNights ? {...styles.input, ...styles.inputError} : styles.input}
                  placeholder="Enter number of nights"
                />
                {errors.numberOfNights && <span style={styles.errorText}>{errors.numberOfNights}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Check-In Date & Time <span style={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  style={errors.checkInDate ? {...styles.input, ...styles.inputError} : styles.input}
                />
                {errors.checkInDate && <span style={styles.errorText}>{errors.checkInDate}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Expected Check-Out Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  style={{...styles.input, backgroundColor: "#fafafa"}}
                  readOnly
                />
                <span style={styles.helpText}>Checkout is at 12:00 PM (noon)</span>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Payment Information</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Amount to Pay (GHS)
                </label>
                <input
                  type="number"
                  name="amountToPay"
                  value={formData.amountToPay}
                  onChange={handleChange}
                  style={{...styles.input, backgroundColor: "#fafafa"}}
                  placeholder="0.00"
                  readOnly
                />
                <span style={styles.helpText}>Auto-calculated: Room price × nights</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Amount Paid (GHS) <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  style={errors.amountPaid ? {...styles.input, ...styles.inputError} : styles.input}
                  placeholder="Enter amount paid"
                />
                {errors.amountPaid && <span style={styles.errorText}>{errors.amountPaid}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Balance (GHS)
                </label>
                <input
                  type="text"
                  name="balance"
                  value={formData.balance}
                  style={{...styles.input, backgroundColor: "#fafafa"}}
                  readOnly
                />
                <span style={styles.helpText}>Remaining amount to be paid</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Payment Method <span style={styles.required}>*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          {formData.selectedRoom && formData.numberOfNights && (
            <div style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}>Booking Summary</h3>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Room:</span>
                  <span style={styles.summaryValue}>
                    {availableRooms.find(r => r.number === formData.selectedRoom)?.number} - 
                    {availableRooms.find(r => r.number === formData.selectedRoom)?.type}
                  </span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Nights:</span>
                  <span style={styles.summaryValue}>{formData.numberOfNights}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total Amount:</span>
                  <span style={styles.summaryValue}>GHS {formData.amountToPay}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Balance:</span>
                  <span style={{...styles.summaryValue, color: formData.balance > 0 ? "#ef4444" : "#10b981"}}>
                    GHS {formData.balance || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Processing Check-In..." : "Complete Check-In"}
            </button>
          </div>
        </form>
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
  },
  backLink: {
    display: "inline-block",
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#000000",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#333333",
    margin: 0,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: {
    borderBottom: "1px solid #e5e5e5",
    paddingBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "1.5rem",
    marginTop: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
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
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "white",
  },
  select: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: "0.85rem",
    color: "#ef4444",
  },
  helpText: {
    fontSize: "0.85rem",
    color: "#4b5563",
    fontStyle: "italic",
    fontWeight: "500",
  },
  summaryBox: {
    backgroundColor: "#dbeafe",
    border: "3px solid #2563eb",
    borderRadius: "8px",
    padding: "1.5rem",
  },
  summaryTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 0,
    marginBottom: "1rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: "0.95rem",
    color: "#1f2937",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: "1.05rem",
    color: "#000000",
    fontWeight: "700",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    paddingTop: "1rem",
  },
  cancelButton: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1f2937",
    backgroundColor: "white",
    border: "2px solid #6b7280",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitButton: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
}

export default CheckIn
