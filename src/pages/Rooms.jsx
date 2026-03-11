import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { roomsAPI } from "../services/api"
import "../index.css"

function Rooms() {
  // Room data from API
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const filters = {};
        if (filterStatus !== "All") filters.status = filterStatus;
        if (filterType !== "All") filters.type = filterType;
        
        const data = await roomsAPI.getAll(filters);
        setRooms(data.rooms || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        alert("Failed to load rooms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [filterStatus, filterType]);

  // Get unique room types
  const roomTypes = ["All", "Executive Suite", "Deluxe Room", "Standard Room", "Budget Room"];

  // Filter rooms based on selected filters
  const filteredRooms = rooms;

  // Get status color - as per requirements
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "#10b981" // Green
      case "Occupied":
        return "#ef4444" // Red
      case "Reserved":
        return "#eab308" // Yellow
      case "Cleaning":
        return "#3b82f6" // Blue
      case "Maintenance":
        return "#6b7280" // Gray
      default:
        return "#6b7280"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Available":
        return "✅"
      case "Occupied":
        return "🔒"
      case "Reserved":
        return "📅"
      case "Cleaning":
        return "🧹"
      case "Maintenance":
        return "🔧"
      default:
        return "❓"
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Room Management</h1>
          <p style={styles.subtitle}>Manage and view all hotel rooms</p>
        </div>
        <button style={styles.addButton}>
          <span style={{ marginRight: "0.5rem" }}>➕</span>
          Add New Room
        </button>
      </header>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Room Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.filterSelect}
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={styles.resultsCount}>
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🏨</div>
          <div>
            <div style={styles.summaryValue}>{rooms.length}</div>
            <div style={styles.summaryLabel}>Total Rooms</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>✅</div>
          <div>
            <div style={styles.summaryValue}>
              {rooms.filter(r => r.status === "Available").length}
            </div>
            <div style={styles.summaryLabel}>Available</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🔒</div>
          <div>
            <div style={styles.summaryValue}>
              {rooms.filter(r => r.status === "Occupied").length}
            </div>
            <div style={styles.summaryLabel}>Occupied</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>�</div>
          <div>
            <div style={styles.summaryValue}>
              {rooms.filter(r => r.status === "Reserved").length}
            </div>
            <div style={styles.summaryLabel}>Reserved</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🧹</div>
          <div>
            <div style={styles.summaryValue}>
              {rooms.filter(r => r.status === "Cleaning").length}
            </div>
            <div style={styles.summaryLabel}>Cleaning</div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div style={styles.roomsGrid}>
        {loading ? (
          <div style={styles.loadingMessage}>Loading rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div style={styles.emptyMessage}>No rooms found matching the filters.</div>
        ) : (
          filteredRooms.map(room => (
            <div key={room.id} style={styles.roomCard}>
              <div style={styles.roomHeader}>
                <div style={styles.roomNumber}>Room {room.number}</div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(room.status),
                  }}
                >
                  {getStatusIcon(room.status)} {room.status}
                </div>
              </div>

              <div style={styles.roomDetails}>
                <div style={styles.roomDetailItem}>
                  <span style={styles.roomDetailLabel}>Type:</span>
                  <span style={styles.roomDetailValue}>{room.type}</span>
                </div>
                <div style={styles.roomDetailItem}>
                  <span style={styles.roomDetailLabel}>Features:</span>
                  <span style={styles.roomDetailValue}>{room.features ? room.features.join(', ') : 'N/A'}</span>
                </div>
                <div style={styles.roomDetailItem}>
                  <span style={styles.roomDetailLabel}>Price:</span>
                  <span style={styles.roomPrice}>GHS {room.price}/night</span>
                </div>
              </div>

              <div style={styles.roomActions}>
                <button style={styles.actionButton}>View Details</button>
                <button style={styles.actionButtonSecondary}>Edit</button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredRooms.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <p style={styles.emptyText}>No rooms found matching your filters</p>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
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
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  addButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  filtersContainer: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  filterLabel: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  filterSelect: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "0.9rem",
    backgroundColor: "white",
    cursor: "pointer",
  },
  resultsCount: {
    marginLeft: "auto",
    fontSize: "0.9rem",
    color: "#666",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: "1.25rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  summaryIcon: {
    fontSize: "2rem",
  },
  summaryValue: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  summaryLabel: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: "0.25rem",
  },
  roomsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  roomCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  roomHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #f0f0f0",
  },
  roomNumber: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "white",
  },
  roomDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  roomDetailItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  roomDetailLabel: {
    color: "#666",
  },
  roomDetailValue: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  roomPrice: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  roomActions: {
    display: "flex",
    gap: "0.75rem",
  },
  actionButton: {
    flex: 1,
    padding: "0.6rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  actionButtonSecondary: {
    flex: 1,
    padding: "0.6rem 1rem",
    backgroundColor: "white",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#666",
  },
  loadingMessage: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "3rem",
    fontSize: "1.1rem",
    color: "#666",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  emptyMessage: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "3rem",
    fontSize: "1rem",
    color: "#666",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}

export default Rooms
