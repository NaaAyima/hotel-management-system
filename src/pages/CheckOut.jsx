import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { guestsAPI, paymentsAPI } from "../services/api"
import "../index.css"

function CheckOut() {
  const navigate = useNavigate()
  
  // Occupied rooms from API
  const [occupiedRooms, setOccupiedRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch occupied rooms (checked-in guests)
  useEffect(() => {
    const fetchOccupiedRooms = async () => {
      try {
        const data = await guestsAPI.getAll({ status: 'Checked In' })
        // Transform API data to match component structure
        const rooms = data.guests.map(guest => ({
          number: guest.roomNumber,
          type: guest.roomType || '',
          price: guest.roomPrice || 0,
          guestName: guest.name,
          phoneNumber: guest.phone,
          checkInDate: guest.checkInDate ? guest.checkInDate.split('T')[0] : '',
          checkInTime: guest.checkInTime || '',
          numberOfNights: guest.numberOfNights || 0,
          checkOutDate: guest.checkOutDate ? guest.checkOutDate.split('T')[0] : '',
          amountPaid: guest.amountPaid || 0,
          totalAmount: guest.totalAmount || 0,
          balance: guest.balance || 0,
          paymentMethod: guest.paymentMethod || 'Cash',
          guestId: guest.id
        }))
        setOccupiedRooms(rooms)
      } catch (error) {
        console.error("Error fetching occupied rooms:", error)
        alert("Failed to load occupied rooms. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOccupiedRooms()
  }, [])

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [additionalCharges, setAdditionalCharges] = useState("")
  const [chargesDescription, setChargesDescription] = useState("")
  const [additionalPayment, setAdditionalPayment] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate final bill
  const calculateFinalBill = () => {
    if (!selectedRoom) return { subtotal: 0, additional: 0, previousBalance: 0, newPayment: 0, finalBalance: 0, grandTotal: 0 }
    
    const subtotal = selectedRoom.totalAmount
    const additional = parseFloat(additionalCharges || 0)
    const previousBalance = selectedRoom.balance
    const newPayment = parseFloat(additionalPayment || 0)
    const grandTotal = subtotal + additional
    const finalBalance = grandTotal - selectedRoom.amountPaid - newPayment
    
    return {
      subtotal,
      additional,
      previousBalance,
      newPayment,
      totalPaid: selectedRoom.amountPaid + newPayment,
      finalBalance,
      grandTotal
    }
  }

  const bill = calculateFinalBill()

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setAdditionalCharges("")
    setChargesDescription("")
    setAdditionalPayment("")
    setShowSuccess(false)
  }

  // Handle checkout
  const handleCheckOut = async (e) => {
    e.preventDefault()

    if (!selectedRoom) {
      alert("Please select a room to checkout")
      return
    }

    // Check if there's an outstanding balance
    if (bill.finalBalance > 0) {
      const confirm = window.confirm(
        `Guest has an outstanding balance of GHS ${bill.finalBalance.toFixed(2)}.\n\nDo you want to proceed with checkout?`
      )
      if (!confirm) return
    }

    setSubmitting(true)

    try {
      // Create payment record for checkout
      if (bill.grandTotal > 0) {
        await paymentsAPI.create({
          guestName: selectedRoom.guestName,
          roomNumber: selectedRoom.number,
          amount: bill.grandTotal,
          paymentType: "Check-Out",
          paymentMethod: paymentMethod,
          status: "Completed"
        })
      }

      // Update guest status to Checked Out
      await guestsAPI.update(selectedRoom.guestId, {
        status: "Checked Out"
      })

      setShowSuccess(true)

      // Navigate to rooms page after showing success
      setTimeout(() => {
        alert(`Room ${selectedRoom.number} checked out successfully!\n\nGuest: ${selectedRoom.guestName}\nFinal Bill: GHS ${bill.grandTotal.toFixed(2)}\nTotal Paid: GHS ${bill.totalPaid.toFixed(2)}\nBalance: GHS ${bill.finalBalance.toFixed(2)}\n\nRoom status changed to CLEANING.`)
        navigate("/rooms")
      }, 1000)
    } catch (error) {
      console.error("Error processing checkout:", error)
      alert("Failed to complete checkout. Please try again.")
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
          <h1 style={styles.title}>Guest Check-Out</h1>
          <p style={styles.subtitle}>Process guest checkout and settle bills</p>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Left Side - Occupied Rooms List */}
        <div style={styles.roomsSection}>
          <h2 style={styles.sectionTitle}>Occupied Rooms ({occupiedRooms.length})</h2>
          {loading ? (
            <div style={styles.loadingMessage}>
              <p>Loading occupied rooms...</p>
            </div>
          ) : occupiedRooms.length === 0 ? (
            <div style={styles.emptyMessage}>
              <p>No occupied rooms found.</p>
            </div>
          ) : (
          <div style={styles.roomsList}>
            {occupiedRooms.map(room => (
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
                  <span style={styles.roomType}>{room.type}</span>
                </div>
                <div style={styles.roomDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Guest:</span>
                    <span style={styles.detailValue}>{room.guestName}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Phone:</span>
                    <span style={styles.detailValue}>{room.phoneNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Check-In:</span>
                    <span style={styles.detailValue}>{room.checkInDate} {room.checkInTime}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Nights:</span>
                    <span style={styles.detailValue}>{room.numberOfNights}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Balance:</span>
                    <span style={{
                      ...styles.detailValue,
                      color: room.balance > 0 ? "#ef4444" : "#10b981",
                      fontWeight: "600"
                    }}>
                      GHS {room.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Right Side - Checkout Form */}
        <div style={styles.checkoutSection}>
          {!selectedRoom ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>👈</span>
              <h3 style={styles.emptyTitle}>Select a Room</h3>
              <p style={styles.emptyText}>Click on an occupied room to process checkout</p>
            </div>
          ) : (
            <form onSubmit={handleCheckOut} style={styles.form}>
              {showSuccess && (
                <div style={styles.successBanner}>
                  ✅ Processing checkout... Redirecting to rooms page
                </div>
              )}

              {/* Guest Information */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Guest Information</h2>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Guest Name:</span>
                    <span style={styles.infoValue}>{selectedRoom.guestName}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Phone:</span>
                    <span style={styles.infoValue}>{selectedRoom.phoneNumber}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Room:</span>
                    <span style={styles.infoValue}>Room {selectedRoom.number} - {selectedRoom.type}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Rate:</span>
                    <span style={styles.infoValue}>GHS {selectedRoom.price}/night</span>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Stay Details</h2>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Check-In:</span>
                    <span style={styles.infoValue}>{selectedRoom.checkInDate} {selectedRoom.checkInTime}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Check-Out:</span>
                    <span style={styles.infoValue}>{selectedRoom.checkOutDate} 12:00 PM</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Nights Stayed:</span>
                    <span style={styles.infoValue}>{selectedRoom.numberOfNights}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Room Charges:</span>
                    <span style={styles.infoValue}>GHS {selectedRoom.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Additional Charges (Optional)</h2>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <input
                      type="text"
                      value={chargesDescription}
                      onChange={(e) => setChargesDescription(e.target.value)}
                      style={styles.input}
                      placeholder="e.g., Room service, Mini bar, Laundry"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Amount (GHS)</label>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(e.target.value)}
                      min="0"
                      step="0.01"
                      style={styles.input}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Settlement */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Payment Settlement</h2>
                <div style={styles.paymentSummary}>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Room Charges:</span>
                    <span style={styles.summaryValue}>GHS {bill.subtotal.toFixed(2)}</span>
                  </div>
                  {bill.additional > 0 && (
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Additional Charges:</span>
                      <span style={styles.summaryValue}>GHS {bill.additional.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Previous Payment:</span>
                    <span style={styles.summaryValue}>GHS {selectedRoom.amountPaid.toFixed(2)}</span>
                  </div>
                  <div style={{...styles.summaryRow, ...styles.summaryTotal}}>
                    <span style={styles.summaryLabel}>Grand Total:</span>
                    <span style={styles.summaryValue}>GHS {bill.grandTotal.toFixed(2)}</span>
                  </div>
                  <div style={{...styles.summaryRow, ...styles.summaryBalance}}>
                    <span style={styles.summaryLabel}>Previous Balance:</span>
                    <span style={{
                      ...styles.summaryValue,
                      color: bill.previousBalance > 0 ? "#ef4444" : "#10b981"
                    }}>
                      GHS {bill.previousBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {bill.previousBalance > 0 && (
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Additional Payment (GHS)</label>
                      <input
                        type="number"
                        value={additionalPayment}
                        onChange={(e) => setAdditionalPayment(e.target.value)}
                        min="0"
                        step="0.01"
                        style={styles.input}
                        placeholder="Enter payment amount"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={styles.select}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Final Balance */}
                <div style={styles.finalBalanceBox}>
                  <div style={styles.finalBalanceRow}>
                    <span style={styles.finalBalanceLabel}>Total Paid:</span>
                    <span style={styles.finalBalanceValue}>GHS {bill.totalPaid.toFixed(2)}</span>
                  </div>
                  <div style={styles.finalBalanceRow}>
                    <span style={styles.finalBalanceLabel}>Final Balance:</span>
                    <span style={{
                      ...styles.finalBalanceValue,
                      color: bill.finalBalance > 0 ? "#dc2626" : "#059669",
                      fontSize: "1.5rem"
                    }}>
                      GHS {bill.finalBalance.toFixed(2)}
                    </span>
                  </div>
                  {bill.finalBalance > 0 && (
                    <div style={styles.warningText}>
                      ⚠️ Outstanding balance will be noted in checkout records
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Processing Check-Out..." : "Complete Check-Out"}
                </button>
              </div>
            </form>
          )}
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
  mainContent: {
    display: "grid",
    gridTemplateColumns: "400px 1fr",
    gap: "2rem",
    alignItems: "start",
  },
  roomsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content",
    maxHeight: "calc(100vh - 200px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 1rem 0",
  },
  roomsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  roomCard: {
    padding: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "white",
  },
  roomCardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
  roomHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
  },
  roomNumber: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#000000",
  },
  roomType: {
    fontSize: "0.85rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  roomDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  detailLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    color: "#000000",
    fontWeight: "600",
  },
  checkoutSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    minHeight: "500px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "500px",
    color: "#9ca3af",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    margin: "0 0 0.5rem 0",
    color: "#6b7280",
  },
  emptyText: {
    fontSize: "1rem",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  successBanner: {
    padding: "1rem",
    backgroundColor: "#d1fae5",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#065f46",
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    borderBottom: "1px solid #e5e5e5",
    paddingBottom: "1.5rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  infoLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "1rem",
    color: "#000000",
    fontWeight: "600",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
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
  paymentSummary: {
    backgroundColor: "#f9fafb",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    fontSize: "1rem",
  },
  summaryTotal: {
    borderTop: "2px solid #d1d5db",
    marginTop: "0.5rem",
    paddingTop: "1rem",
    fontWeight: "700",
  },
  summaryBalance: {
    borderTop: "1px solid #e5e7eb",
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
  },
  summaryLabel: {
    color: "#4b5563",
    fontWeight: "600",
  },
  summaryValue: {
    color: "#000000",
    fontWeight: "700",
  },
  finalBalanceBox: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    borderRadius: "8px",
    padding: "1.5rem",
    marginTop: "1rem",
  },
  finalBalanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
  },
  finalBalanceLabel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e3a8a",
  },
  finalBalanceValue: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#000000",
  },
  warningText: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "6px",
    color: "#92400e",
    fontSize: "0.9rem",
    fontWeight: "600",
    textAlign: "center",
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

export default CheckOut
