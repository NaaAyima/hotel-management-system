import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { paymentsAPI } from "../services/api"
import "../index.css"

function Payments() {
  // Payments from API
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [filterMethod, setFilterMethod] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  })

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const filters = {}
        if (filterType !== "All") filters.type = filterType
        if (filterMethod !== "All") filters.method = filterMethod
        if (filterStatus !== "All") filters.status = filterStatus
        if (dateRange.startDate) filters.startDate = dateRange.startDate
        if (dateRange.endDate) filters.endDate = dateRange.endDate
        
        const data = await paymentsAPI.getAll(filters)
        // Transform API data to match component structure
        const payments = data.payments.map(payment => ({
          id: payment.id,
          date: payment.paymentDate ? payment.paymentDate.split('T')[0] : '',
          time: payment.paymentDate ? new Date(payment.paymentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
          type: payment.paymentType,
          room: payment.roomNumber || '',
          guest: payment.guestName,
          amount: payment.amount,
          method: payment.paymentMethod,
          status: payment.status,
          reference: payment.reference || `TXN${String(payment.id).padStart(3, '0')}`
        }))
        setAllTransactions(payments)
      } catch (error) {
        console.error("Error fetching payments:", error)
        alert("Failed to load payment transactions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [filterType, filterMethod, filterStatus, dateRange])

  // Filter transactions
  const filteredTransactions = allTransactions.filter(txn => {
    const matchesSearch = 
      txn.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.room.includes(searchTerm) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "All" || txn.type === filterType
    const matchesMethod = filterMethod === "All" || txn.method === filterMethod
    const matchesStatus = filterStatus === "All" || txn.status === filterStatus
    
    const matchesDateRange = (!dateRange.startDate || txn.date >= dateRange.startDate) &&
                             (!dateRange.endDate || txn.date <= dateRange.endDate)
    
    return matchesSearch && matchesType && matchesMethod && matchesStatus && matchesDateRange
  })

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0)
  const totalTransactions = filteredTransactions.length

  const totalByMethod = {
    Cash: filteredTransactions.filter(t => t.method === "Cash").reduce((sum, t) => sum + t.amount, 0),
    "Mobile Money": filteredTransactions.filter(t => t.method === "Mobile Money").reduce((sum, t) => sum + t.amount, 0),
    Card: filteredTransactions.filter(t => t.method === "Card").reduce((sum, t) => sum + t.amount, 0),
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("All")
    setFilterMethod("All")
    setFilterStatus("All")
    setDateRange({ startDate: "", endDate: "" })
  }

  const exportToCSV = () => {
    let csv = "Date,Time,Type,Room,Guest,Amount (GHS),Method,Status,Reference\n"
    filteredTransactions.forEach(txn => {
      csv += `${txn.date},${txn.time},${txn.type},${txn.room},${txn.guest},${txn.amount},${txn.method},${txn.status},${txn.reference}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `payment_history_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getTypeColor = (type) => {
    switch(type) {
      case "Check-In": return "#3b82f6"
      case "Check-Out": return "#16a34a"
      case "Booking Deposit": return "#eab308"
      default: return "#6b7280"
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Payment History & Transactions</h1>
        </div>
        <button onClick={exportToCSV} style={styles.exportButton}>
          📥 Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Total Amount</p>
            <h2 style={styles.summaryValue}>GHS {totalAmount.toFixed(2)}</h2>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Total Transactions</p>
            <h2 style={styles.summaryValue}>{totalTransactions}</h2>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💵</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Cash</p>
            <h2 style={styles.summaryValue}>GHS {totalByMethod.Cash.toFixed(2)}</h2>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📱</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Mobile Money</p>
            <h2 style={styles.summaryValue}>GHS {totalByMethod["Mobile Money"].toFixed(2)}</h2>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💳</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Card</p>
            <h2 style={styles.summaryValue}>GHS {totalByMethod.Card.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by guest name, room number, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Types</option>
              <option value="Check-In">Check-In</option>
              <option value="Check-Out">Check-Out</option>
              <option value="Booking Deposit">Booking Deposit</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Payment Method:</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Start Date:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>End Date:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              style={styles.dateInput}
            />
          </div>

          <button onClick={clearFilters} style={styles.clearButton}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={styles.tableSection}>
        {loading ? (
          <div style={styles.loadingMessage}>
            <p>Loading payment transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={styles.emptyMessage}>
            <p>No payment transactions found matching the filters.</p>
          </div>
        ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Guest</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.dateTimeCell}>
                      <div style={styles.dateText}>{txn.date}</div>
                      <div style={styles.timeText}>{txn.time}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span 
                      style={{
                        ...styles.typeBadge,
                        backgroundColor: getTypeColor(txn.type)
                      }}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong>Room {txn.room}</strong>
                  </td>
                  <td style={styles.td}>{txn.guest}</td>
                  <td style={{...styles.td, fontWeight: "700", color: "#16a34a", fontSize: "1.05rem"}}>
                    GHS {txn.amount.toFixed(2)}
                  </td>
                  <td style={styles.td}>{txn.method}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>
                      ✓ {txn.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.referenceCode}>{txn.reference}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div style={styles.summaryFooter}>
          <div style={styles.footerItem}>
            <strong>Showing:</strong> {filteredTransactions.length} transaction(s)
          </div>
          <div style={styles.footerItem}>
            <strong>Total Amount:</strong> GHS {totalAmount.toFixed(2)}
          </div>
        </div>
      )}
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
    flexWrap: "wrap",
    gap: "1rem",
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
  exportButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  summarySection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  summaryIcon: {
    fontSize: "2.5rem",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
    margin: "0 0 0.25rem 0",
  },
  summaryValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    margin: 0,
    color: "#1f2937",
  },
  filterSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  searchBox: {
    marginBottom: "1.5rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#1f2937",
  },
  filterRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: "1 1 180px",
  },
  filterLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  filterSelect: {
    padding: "0.6rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#1f2937",
  },
  dateInput: {
    padding: "0.6rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#1f2937",
  },
  clearButton: {
    padding: "0.6rem 1.5rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  tableSection: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "700",
    color: "#1f2937",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "1rem",
    color: "#1f2937",
  },
  dateTimeCell: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  dateText: {
    fontWeight: "600",
    color: "#1f2937",
  },
  timeText: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  typeBadge: {
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
  },
  referenceCode: {
    backgroundColor: "#f3f4f6",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    color: "#374151",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#6b7280",
    marginBottom: "1rem",
  },
  summaryFooter: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  footerItem: {
    fontSize: "1rem",
    color: "#374151",
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

export default Payments
