import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { guestsAPI } from "../services/api"
import "../index.css"

function Guests() {
  // Guest records from API
  const [allGuests, setAllGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedGuest, setSelectedGuest] = useState(null)

  // Fetch guests from API
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const filters = {};
        if (filterStatus !== "All") filters.status = filterStatus;
        if (searchQuery) filters.search = searchQuery;
        
        const data = await guestsAPI.getAll(filters);
        setAllGuests(data.guests || []);
      } catch (error) {
        console.error("Error fetching guests:", error);
        alert("Failed to load guests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [filterStatus, searchQuery]);

  // Filter guests - now handled by API
  const filteredGuests = allGuests;

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "Checked In": return "#10b981"
      case "Reserved": return "#f59e0b"
      case "Checked Out": return "#6b7280"
      default: return "#6b7280"
    }
  }

  // Get payment status
  const getPaymentStatus = (balance) => {
    if (balance === 0) return { text: "Paid", color: "#10b981" }
    if (balance > 0) return { text: "Pending", color: "#ef4444" }
    return { text: "Overpaid", color: "#3b82f6" }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Guest Management</h1>
          <p style={styles.subtitle}>View and manage all guest records</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>👤</span>
          <div>
            <p style={styles.statValue}>{allGuests.filter(g => g.status === "Checked In").length}</p>
            <p style={styles.statLabel}>Current Guests</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📅</span>
          <div>
            <p style={styles.statValue}>{allGuests.filter(g => g.status === "Reserved").length}</p>
            <p style={styles.statLabel}>Reservations</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <p style={styles.statValue}>{allGuests.filter(g => g.status === "Checked Out").length}</p>
            <p style={styles.statLabel}>Past Guests</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>💰</span>
          <div>
            <p style={styles.statValue}>GHS {allGuests.reduce((sum, g) => sum + g.balance, 0).toFixed(0)}</p>
            <p style={styles.statLabel}>Outstanding Balance</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={styles.controlsSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search by name, phone, room, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterBox}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Guests ({allGuests.length})</option>
            <option value="Checked In">Checked In ({allGuests.filter(g => g.status === "Checked In").length})</option>
            <option value="Reserved">Reserved ({allGuests.filter(g => g.status === "Reserved").length})</option>
            <option value="Checked Out">Checked Out ({allGuests.filter(g => g.status === "Checked Out").length})</option>
          </select>
        </div>
      </div>

      {/* Guests List */}
      <div style={styles.mainContent}>
        <div style={styles.guestsListSection}>
          <h2 style={styles.sectionTitle}>
            Guests ({filteredGuests.length})
          </h2>
          
          {loading ? (
            <div style={styles.loadingMessage}>
              <p>Loading guests...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔍</span>
              <p style={styles.emptyText}>No guests found</p>
            </div>
          ) : (
            <div style={styles.guestsList}>
              {filteredGuests.map(guest => {
                const paymentStatus = getPaymentStatus(guest.balance)
                return (
                  <div
                    key={guest.id}
                    style={{
                      ...styles.guestCard,
                      ...(selectedGuest?.id === guest.id ? styles.guestCardSelected : {})
                    }}
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div style={styles.guestCardHeader}>
                      <div>
                        <h3 style={styles.guestName}>{guest.name}</h3>
                        <p style={styles.guestId}>ID: {guest.id}</p>
                      </div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(guest.status) + "20",
                          color: getStatusColor(guest.status),
                          border: `2px solid ${getStatusColor(guest.status)}`
                        }}
                      >
                        {guest.status}
                      </span>
                    </div>
                    
                    <div style={styles.guestCardBody}>
                      <div style={styles.guestDetail}>
                        <span style={styles.detailLabel}>Room:</span>
                        <span style={styles.detailValue}>Room {guest.roomNumber} - {guest.roomType}</span>
                      </div>
                      <div style={styles.guestDetail}>
                        <span style={styles.detailLabel}>Phone:</span>
                        <span style={styles.detailValue}>{guest.phone}</span>
                      </div>
                      <div style={styles.guestDetail}>
                        <span style={styles.detailLabel}>Check-In:</span>
                        <span style={styles.detailValue}>{guest.checkInDate}</span>
                      </div>
                      <div style={styles.guestDetail}>
                        <span style={styles.detailLabel}>Check-Out:</span>
                        <span style={styles.detailValue}>{guest.checkOutDate}</span>
                      </div>
                      <div style={styles.guestDetail}>
                        <span style={styles.detailLabel}>Payment:</span>
                        <span style={{
                          ...styles.detailValue,
                          color: paymentStatus.color,
                          fontWeight: "700"
                        }}>
                          {paymentStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Guest Details Panel */}
        {selectedGuest ? (
          <div style={styles.detailsPanel}>
            <div style={styles.detailsHeader}>
              <h2 style={styles.detailsTitle}>Guest Details</h2>
              <button
                onClick={() => setSelectedGuest(null)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.detailsContent}>
              {/* Personal Information */}
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsSectionTitle}>Personal Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Full Name:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.name}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Phone:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.phone}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Email:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.email}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>ID Number:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.idNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Guest ID:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.id}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Status:</span>
                    <span style={{
                      ...styles.detailRowValue,
                      color: getStatusColor(selectedGuest.status),
                      fontWeight: "700"
                    }}>
                      {selectedGuest.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsSectionTitle}>Booking Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Room Number:</span>
                    <span style={styles.detailRowValue}>Room {selectedGuest.roomNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Room Type:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.roomType}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Room Rate:</span>
                    <span style={styles.detailRowValue}>GHS {selectedGuest.roomPrice}/night</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Check-In:</span>
                    <span style={styles.detailRowValue}>
                      {selectedGuest.checkInDate} {selectedGuest.checkInTime}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Check-Out:</span>
                    <span style={styles.detailRowValue}>
                      {selectedGuest.checkOutDate} {selectedGuest.checkOutTime}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailRowLabel}>Nights:</span>
                    <span style={styles.detailRowValue}>{selectedGuest.numberOfNights}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsSectionTitle}>Payment Information</h3>
                <div style={styles.paymentBox}>
                  <div style={styles.paymentRow}>
                    <span style={styles.paymentLabel}>Total Amount:</span>
                    <span style={styles.paymentValue}>GHS {selectedGuest.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={styles.paymentRow}>
                    <span style={styles.paymentLabel}>Amount Paid:</span>
                    <span style={styles.paymentValue}>GHS {selectedGuest.amountPaid.toFixed(2)}</span>
                  </div>
                  <div style={styles.paymentRow}>
                    <span style={styles.paymentLabel}>Payment Method:</span>
                    <span style={styles.paymentValue}>{selectedGuest.paymentMethod}</span>
                  </div>
                  <div style={{...styles.paymentRow, ...styles.paymentTotal}}>
                    <span style={styles.paymentLabel}>Balance:</span>
                    <span style={{
                      ...styles.paymentValue,
                      color: selectedGuest.balance > 0 ? "#dc2626" : "#059669",
                      fontSize: "1.4rem"
                    }}>
                      GHS {selectedGuest.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedGuest.notes && (
                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Notes</h3>
                  <p style={styles.notesText}>{selectedGuest.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.detailsPanel}>
            <div style={styles.emptyDetailsState}>
              <span style={styles.emptyIcon}>👈</span>
              <h3 style={styles.emptyDetailsTitle}>Select a Guest</h3>
              <p style={styles.emptyDetailsText}>Click on a guest card to view details</p>
            </div>
          </div>
        )}
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 0.25rem 0",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: 0,
  },
  controlsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "300px",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "white",
    color: "#000000",
  },
  filterBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  filterLabel: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  filterSelect: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    color: "#000000",
    minWidth: "200px",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 450px",
    gap: "2rem",
    alignItems: "start",
  },
  guestsListSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 1.5rem 0",
  },
  guestsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "calc(100vh - 450px)",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  guestCard: {
    padding: "1.25rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "white",
  },
  guestCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
  },
  guestCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  guestName: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 0.25rem 0",
  },
  guestId: {
    fontSize: "0.85rem",
    color: "#6b7280",
    margin: 0,
  },
  statusBadge: {
    padding: "0.375rem 0.875rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  guestCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  guestDetail: {
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
  detailsPanel: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxHeight: "calc(100vh - 300px)",
    overflowY: "auto",
    position: "sticky",
    top: "2rem",
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e5e7eb",
  },
  detailsTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
  },
  closeButton: {
    padding: "0.5rem",
    fontSize: "1.25rem",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    lineHeight: 1,
  },
  detailsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  detailsSection: {
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  detailsSectionTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 1rem 0",
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRowLabel: {
    fontSize: "0.9rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  detailRowValue: {
    fontSize: "0.95rem",
    color: "#000000",
    fontWeight: "600",
    textAlign: "right",
  },
  paymentBox: {
    backgroundColor: "#dbeafe",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    padding: "1.25rem",
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
  },
  paymentTotal: {
    borderTop: "2px solid #1e40af",
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
  },
  paymentLabel: {
    fontSize: "0.95rem",
    color: "#1f2937",
    fontWeight: "600",
  },
  paymentValue: {
    fontSize: "1.05rem",
    color: "#000000",
    fontWeight: "700",
  },
  notesText: {
    fontSize: "0.95rem",
    color: "#374151",
    lineHeight: "1.6",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    color: "#9ca3af",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyText: {
    fontSize: "1.1rem",
    margin: 0,
    color: "#6b7280",
  },
  emptyDetailsState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    color: "#9ca3af",
  },
  emptyDetailsTitle: {
    fontSize: "1.25rem",
    margin: "0 0 0.5rem 0",
    color: "#6b7280",
  },
  emptyDetailsText: {
    fontSize: "1rem",
    margin: 0,
  },
  loadingMessage: {
    textAlign: "center",
    padding: "3rem 2rem",
    fontSize: "1.1rem",
    color: "#6b7280",
  },
}

export default Guests
