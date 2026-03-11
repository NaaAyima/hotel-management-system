import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { roomsAPI, bookingsAPI } from "../services/api"
import "../index.css"

function Booking() {
  const navigate = useNavigate()
  
  // Rooms from API
  const [allRooms, setAllRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomsAPI.getAll({})
        // Transform API data to match component structure
        const rooms = data.rooms.map(room => ({
          number: room.roomNumber,
          type: room.type,
          price: room.pricePerNight,
          features: Array.isArray(room.features) ? room.features.join(', ') : room.features,
          status: room.status,
          id: room.id
        }))
        setAllRooms(rooms)
      } catch (error) {
        console.error("Error fetching rooms:", error)
        alert("Failed to load rooms. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const [searchDates, setSearchDates] = useState({
    checkIn: "",
    checkOut: ""
  })

  const [showAvailableRooms, setShowAvailableRooms] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const [formData, setFormData] = useState({
    guestName: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfNights: "",
    depositAmount: "",
    paymentMethod: "Cash",
    notes: ""
  })

  const [errors, setErrors] = useState({})

  // Get available rooms (exclude Occupied and Cleaning)
  const getAvailableRooms = () => {
    return allRooms.filter(room => 
      room.status === "Available" || room.status === "Reserved"
    )
  }

  // Calculate number of nights
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 0
  }

  // Calculate total amount
  const calculateTotal = () => {
    if (!selectedRoom || !formData.numberOfNights) return 0
    return selectedRoom.price * parseInt(formData.numberOfNights)
  }

  // Calculate balance
  const calculateBalance = () => {
    const total = calculateTotal()
    const deposit = parseFloat(formData.depositAmount || 0)
    return total - deposit
  }

  // Handle search dates change
  const handleSearchChange = (e) => {
    const { name, value } = e.target
    setSearchDates(prev => {
      const updated = { ...prev, [name]: value }
      
      // Auto-calculate checkout date if check-in is set and it's a check-in change
      if (name === "checkIn" && value) {
        const checkIn = new Date(value)
        checkIn.setDate(checkIn.getDate() + 1) // Default to 1 night
        checkIn.setHours(12, 0, 0, 0) // Set to 12:00 PM
        updated.checkOut = checkIn.toISOString().slice(0, 16)
      }
      
      return updated
    })
  }

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault()
    
    if (!searchDates.checkIn || !searchDates.checkOut) {
      alert("Please select both check-in and check-out dates")
      return
    }

    const nights = calculateNights(searchDates.checkIn, searchDates.checkOut)
    if (nights <= 0) {
      alert("Check-out date must be after check-in date")
      return
    }

    setShowAvailableRooms(true)
    setFormData(prev => ({
      ...prev,
      checkInDate: searchDates.checkIn,
      checkOutDate: searchDates.checkOut,
      numberOfNights: nights.toString()
    }))
  }

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setFormData(prev => ({
      ...prev,
      depositAmount: ""
    }))
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!selectedRoom) newErrors.room = "Please select a room"
    if (!formData.guestName.trim()) newErrors.guestName = "Guest name is required"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (!formData.depositAmount || formData.depositAmount <= 0) {
      newErrors.depositAmount = "Deposit amount is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const total = calculateTotal()
    const balance = calculateBalance()

    setSubmitting(true)

    try {
      const bookingData = {
        roomId: selectedRoom.id,
        guestName: formData.guestName,
        guestPhone: formData.phoneNumber,
        guestEmail: formData.email,
        guestIdNumber: formData.idNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfNights: parseInt(formData.numberOfNights),
        totalAmount: total,
        depositAmount: parseFloat(formData.depositAmount || 0),
        balance: balance,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        status: "Reserved"
      }

      await bookingsAPI.create(bookingData)

      alert(
        `Reservation Created Successfully!\n\n` +
        `Guest: ${formData.guestName}\n` +
        `Room: ${selectedRoom.number} - ${selectedRoom.type}\n` +
        `Check-In: ${new Date(formData.checkInDate).toLocaleDateString()}\n` +
        `Check-Out: ${new Date(formData.checkOutDate).toLocaleDateString()}\n` +
        `Nights: ${formData.numberOfNights}\n` +
        `Total: GHS ${total.toFixed(2)}\n` +
        `Deposit: GHS ${parseFloat(formData.depositAmount).toFixed(2)}\n` +
        `Balance: GHS ${balance.toFixed(2)}\n\n` +
        `Booking saved to database.`
      )
      
      // Navigate to rooms page
      navigate("/rooms")
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Failed to create booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const availableRooms = getAvailableRooms()

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Room Booking & Reservation</h1>
          <p style={styles.subtitle}>Search available rooms and create reservations</p>
        </div>
      </header>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <h2 style={styles.sectionTitle}>Search Available Rooms</h2>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Check-In Date & Time <span style={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="checkIn"
                value={searchDates.checkIn}
                onChange={handleSearchChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Check-Out Date & Time <span style={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="checkOut"
                value={searchDates.checkOut}
                onChange={handleSearchChange}
                style={styles.input}
                required
              />
              <span style={styles.helpText}>Checkout is at 12:00 PM (noon)</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Nights</label>
              <input
                type="text"
                value={calculateNights(searchDates.checkIn, searchDates.checkOut)}
                style={{...styles.input, backgroundColor: "#fafafa"}}
                readOnly
              />
            </div>
          </div>
          <button type="submit" style={styles.searchButton}>
            🔍 Search Available Rooms
          </button>
        </form>
      </div>

      {/* Available Rooms */}
      {showAvailableRooms && (
        <div style={styles.roomsSection}>
          <h2 style={styles.sectionTitle}>
            Available Rooms ({availableRooms.length})
          </h2>
          {loading ? (
            <div style={styles.loadingMessage}>
              <p>Loading rooms...</p>
            </div>
          ) : availableRooms.length === 0 ? (
            <div style={styles.emptyMessage}>
              <p>No available rooms found for the selected dates.</p>
            </div>
          ) : (
          <div style={styles.roomsGrid}>
            {availableRooms.map(room => (
              <div
                key={room.number}
                style={{
                  ...styles.roomCard,
                  ...(selectedRoom?.number === room.number ? styles.roomCardSelected : {})
                }}
                onClick={() => handleRoomSelect(room)}
              >
                <div style={styles.roomHeader}>
                  <span style={styles.roomNumber}>Room {room.number}</span>
                  <span style={styles.roomPrice}>GHS {room.price}/night</span>
                </div>
                <div style={styles.roomBody}>
                  <p style={styles.roomType}>{room.type}</p>
                  <p style={styles.roomFeatures}>{room.features}</p>
                  <span style={styles.roomStatus}>{room.status}</span>
                </div>
                {selectedRoom?.number === room.number && (
                  <div style={styles.selectedBadge}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Reservation Form */}
      {selectedRoom && (
        <div style={styles.formContainer}>
          <h2 style={styles.sectionTitle}>Reservation Details</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Guest Information */}
            <div style={styles.section}>
              <h3 style={styles.subsectionTitle}>Guest Information</h3>
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address (Optional)</label>
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
                  <label style={styles.label}>ID Number (Optional)</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Ghana Card, Passport, etc."
                  />
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div style={styles.section}>
              <h3 style={styles.subsectionTitle}>Booking Summary</h3>
              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Room:</span>
                  <span style={styles.summaryValue}>Room {selectedRoom.number} - {selectedRoom.type}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Rate:</span>
                  <span style={styles.summaryValue}>GHS {selectedRoom.price}/night</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Check-In:</span>
                  <span style={styles.summaryValue}>
                    {formData.checkInDate ? new Date(formData.checkInDate).toLocaleString() : "-"}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Check-Out:</span>
                  <span style={styles.summaryValue}>
                    {formData.checkOutDate ? new Date(formData.checkOutDate).toLocaleString() : "-"}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Nights:</span>
                  <span style={styles.summaryValue}>{formData.numberOfNights}</span>
                </div>
                <div style={{...styles.summaryRow, ...styles.summaryTotal}}>
                  <span style={styles.summaryLabel}>Total Amount:</span>
                  <span style={styles.summaryValue}>GHS {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div style={styles.section}>
              <h3 style={styles.subsectionTitle}>Payment Information</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Deposit Amount (GHS) <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="depositAmount"
                    value={formData.depositAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={errors.depositAmount ? {...styles.input, ...styles.inputError} : styles.input}
                    placeholder="Enter deposit amount"
                  />
                  {errors.depositAmount && <span style={styles.errorText}>{errors.depositAmount}</span>}
                  <span style={styles.helpText}>Minimum deposit required to reserve room</span>
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Balance Due</label>
                  <input
                    type="text"
                    value={`GHS ${calculateBalance().toFixed(2)}`}
                    style={{...styles.input, backgroundColor: "#fafafa"}}
                    readOnly
                  />
                  <span style={styles.helpText}>To be paid at check-in or checkout</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    style={{...styles.input, minHeight: "80px", resize: "vertical"}}
                    placeholder="Special requests or notes"
                  />
                </div>
              </div>
            </div>

            {/* Balance Summary */}
            <div style={styles.balanceBox}>
              <div style={styles.balanceRow}>
                <span style={styles.balanceLabel}>Total Amount:</span>
                <span style={styles.balanceValue}>GHS {calculateTotal().toFixed(2)}</span>
              </div>
              <div style={styles.balanceRow}>
                <span style={styles.balanceLabel}>Deposit:</span>
                <span style={styles.balanceValue}>GHS {parseFloat(formData.depositAmount || 0).toFixed(2)}</span>
              </div>
              <div style={styles.balanceRow}>
                <span style={styles.balanceLabel}>Balance Due:</span>
                <span style={{...styles.balanceValue, color: "#dc2626", fontSize: "1.5rem"}}>
                  GHS {calculateBalance().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoom(null)
                  setShowAvailableRooms(false)
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitButton} disabled={submitting}>
                {submitting ? "Processing..." : "Confirm Reservation"}
              </button>
            </div>
          </form>
        </div>
      )}
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
  searchSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 1.5rem 0",
  },
  searchForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
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
    color: "#000000",
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
  searchButton: {
    padding: "0.875rem 2rem",
    fontSize: "1.05rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    alignSelf: "flex-start",
  },
  roomsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  roomsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  roomCard: {
    padding: "1.5rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "white",
    position: "relative",
  },
  roomCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
  },
  roomHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  roomNumber: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
  },
  roomPrice: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#2563eb",
  },
  roomBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  roomType: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#000000",
    margin: 0,
  },
  roomFeatures: {
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: 0,
  },
  roomStatus: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#059669",
    marginTop: "0.5rem",
  },
  selectedBadge: {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: {
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #e5e5e5",
  },
  subsectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#000000",
    margin: "0 0 1rem 0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.5rem",
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
    color: "#000000",
  },
  summaryBox: {
    backgroundColor: "#dbeafe",
    border: "3px solid #2563eb",
    borderRadius: "8px",
    padding: "1.5rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
  },
  summaryTotal: {
    borderTop: "2px solid #1e40af",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
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
  balanceBox: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    borderRadius: "8px",
    padding: "1.5rem",
  },
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
  },
  balanceLabel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e3a8a",
  },
  balanceValue: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#000000",
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
  loadingMessage: {
    textAlign: "center",
    padding: "3rem 2rem",
    fontSize: "1.1rem",
    color: "#6b7280",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "3rem 2rem",
    fontSize: "1.1rem",
    color: "#6b7280",
  },
}

export default Booking
