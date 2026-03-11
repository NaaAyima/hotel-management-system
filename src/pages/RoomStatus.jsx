import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { roomsAPI } from "../services/api"
import "../index.css"

function RoomStatus() {
  // Rooms from API
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // Track which room is being updated

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const data = await roomsAPI.getAll({})
      // Transform API data to match component structure
      const roomsData = data.rooms.map(room => ({
        id: room.id,
        number: room.roomNumber,
        type: room.type,
        price: room.pricePerNight,
        status: room.status,
        guest: room.currentGuest || null,
        notes: room.notes || ""
      }))
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      alert("Failed to load rooms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [filterStatus, setFilterStatus] = useState("All")
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState("")

  const statusOptions = ["Available", "Occupied", "Reserved", "Cleaning", "Maintenance"]

  const changeRoomStatus = async (roomId, newStatus) => {
    setUpdating(roomId)
    try {
      await roomsAPI.update(roomId, { status: newStatus })
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, status: newStatus } : room
      ))
      alert(`Room ${rooms.find(r => r.id === roomId).number} status changed to ${newStatus}`)
    } catch (error) {
      console.error("Error updating room status:", error)
      alert("Failed to update room status. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  const openNoteModal = (room) => {
    setSelectedRoom(room)
    setNoteText(room.notes)
    setShowNoteModal(true)
  }

  const saveNote = () => {
    if (selectedRoom) {
      setRooms(rooms.map(room =>
        room.id === selectedRoom.id ? { ...room, notes: noteText } : room
      ))
      setShowNoteModal(false)
      setSelectedRoom(null)
      setNoteText("")
      alert("Note saved successfully")
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "Available": return "#16a34a"
      case "Occupied": return "#dc2626"
      case "Reserved": return "#eab308"
      case "Cleaning": return "#3b82f6"
      case "Maintenance": return "#6b7280"
      default: return "#6b7280"
    }
  }

  const filteredRooms = filterStatus === "All" 
    ? rooms 
    : rooms.filter(room => room.status === filterStatus)

  const statusCounts = {
    All: rooms.length,
    Available: rooms.filter(r => r.status === "Available").length,
    Occupied: rooms.filter(r => r.status === "Occupied").length,
    Reserved: rooms.filter(r => r.status === "Reserved").length,
    Cleaning: rooms.filter(r => r.status === "Cleaning").length,
    Maintenance: rooms.filter(r => r.status === "Maintenance").length,
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Room Status Management</h1>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={styles.filterSection}>
        {["All", "Available", "Occupied", "Reserved", "Cleaning", "Maintenance"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              ...styles.filterButton,
              ...(filterStatus === status ? styles.filterButtonActive : {}),
              ...(filterStatus === status && status !== "All" ? 
                { backgroundColor: getStatusColor(status), borderColor: getStatusColor(status) } : {})
            }}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Room Grid */}
      {loading ? (
        <div style={styles.loadingMessage}>
          <p>Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={styles.emptyMessage}>
          <p>No rooms found matching the filter.</p>
        </div>
      ) : (
      <div style={styles.roomGrid}>
        {filteredRooms.map(room => (
          <div key={room.id} style={styles.roomCard}>
            {/* Room Header */}
            <div style={styles.roomHeader}>
              <div style={styles.roomNumber}>Room {room.number}</div>
              <div 
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(room.status)
                }}
              >
                {room.status}
              </div>
            </div>

            {/* Room Details */}
            <div style={styles.roomDetails}>
              <p style={styles.roomType}>{room.type}</p>
              <p style={styles.roomPrice}>GHS {room.price}/night</p>
              {room.guest && (
                <p style={styles.guestInfo}>
                  <strong>Guest:</strong> {room.guest}
                </p>
              )}
              {room.notes && (
                <p style={styles.notePreview}>
                  📝 {room.notes.substring(0, 30)}{room.notes.length > 30 ? "..." : ""}
                </p>
              )}
            </div>

            {/* Status Change Buttons */}
            <div style={styles.statusActions}>
              <div style={styles.statusButtonsGrid}>
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => changeRoomStatus(room.id, status)}
                    disabled={room.status === status}
                    style={{
                      ...styles.statusButton,
                      backgroundColor: getStatusColor(status),
                      opacity: room.status === status ? 0.5 : 1,
                      cursor: room.status === status ? "not-allowed" : "pointer"
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button
                onClick={() => openNoteModal(room)}
                style={styles.noteButton}
              >
                {room.notes ? "📝 Edit Note" : "📝 Add Note"}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No rooms with status: {filterStatus}</p>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedRoom && (
        <div style={styles.modalOverlay} onClick={() => setShowNoteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              Notes for Room {selectedRoom.number}
            </h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={styles.textarea}
              placeholder="Add housekeeping notes, maintenance issues, special instructions..."
              rows={6}
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setSelectedRoom(null)
                  setNoteText("")
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                style={styles.saveButton}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        <h3 style={styles.legendTitle}>Status Guide</h3>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: "#16a34a"}}></div>
            <span><strong>Available:</strong> Ready for new guest</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: "#dc2626"}}></div>
            <span><strong>Occupied:</strong> Guest currently staying</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: "#eab308"}}></div>
            <span><strong>Reserved:</strong> Booked for future date</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: "#3b82f6"}}></div>
            <span><strong>Cleaning:</strong> Being cleaned or inspected</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, backgroundColor: "#6b7280"}}></div>
            <span><strong>Maintenance:</strong> Requires repair or servicing</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  backLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
    color: "#1f2937",
    fontWeight: "700",
  },
  filterSection: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#374151",
    transition: "all 0.2s",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
    fontWeight: "700",
  },
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  roomCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  roomHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #f3f4f6",
  },
  roomNumber: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1f2937",
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  roomDetails: {
    marginBottom: "1rem",
  },
  roomType: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0 0 0.5rem 0",
    fontWeight: "500",
  },
  roomPrice: {
    fontSize: "1.1rem",
    color: "#1f2937",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
  },
  guestInfo: {
    fontSize: "0.9rem",
    color: "#374151",
    margin: "0.5rem 0",
  },
  notePreview: {
    fontSize: "0.85rem",
    color: "#6b7280",
    fontStyle: "italic",
    margin: "0.5rem 0 0 0",
    padding: "0.5rem",
    backgroundColor: "#fef3c7",
    borderRadius: "4px",
  },
  statusActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  statusButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
  },
  statusButton: {
    padding: "0.6rem",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  noteButton: {
    padding: "0.75rem",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "8px",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#6b7280",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "1.5rem",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    resize: "vertical",
    fontFamily: "inherit",
    marginBottom: "1.5rem",
    backgroundColor: "white",
    color: "#1f2937",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  saveButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  legend: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  legendTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  legendItems: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.75rem",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.9rem",
    color: "#374151",
  },
  legendDot: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    flexShrink: 0,
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

export default RoomStatus
