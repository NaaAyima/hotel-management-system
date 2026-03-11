import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { paymentsAPI, guestsAPI, bookingsAPI, roomsAPI } from "../services/api"
import "../index.css"

function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: "2026-03-01",
    endDate: "2026-03-11"
  })

  const [selectedReport, setSelectedReport] = useState("overview")
  const [loading, setLoading] = useState(true)
  
  // Data from API
  const [revenueData, setRevenueData] = useState([])
  const [roomTypeData, setRoomTypeData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  
  // Summary metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    totalBookings: 0,
    avgDailyRevenue: 0,
    currentOccupancy: "0%"
  })

  // Fetch all report data
  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Fetch payment stats
      const paymentStats = await paymentsAPI.getStats()
      
      // Fetch guests for check-in/check-out stats
      const guestsData = await guestsAPI.getAll({})
      
      // Fetch bookings
      const bookingsData = await bookingsAPI.getAll({})
      
      // Fetch rooms for occupancy
      const roomsData = await roomsAPI.getAll({})

      // Process payment data
      const paymentsByMethod = {}
      paymentStats.payments.forEach(payment => {
        const method = payment.paymentMethod
        if (!paymentsByMethod[method]) {
          paymentsByMethod[method] = { transactions: 0, amount: 0 }
        }
        paymentsByMethod[method].transactions++
        paymentsByMethod[method].amount += payment.amount
      })
      
      setPaymentData(
        Object.entries(paymentsByMethod).map(([method, data]) => ({
          method,
          transactions: data.transactions,
          amount: data.amount
        }))
      )

      // Process occupancy data
      const statusCounts = {}
      roomsData.rooms.forEach(room => {
        statusCounts[room.status] = (statusCounts[room.status] || 0) + 1
      })
      
      const totalRooms = roomsData.rooms.length
      setOccupancyData(
        Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
          percentage: `${((count / totalRooms) * 100).toFixed(0)}%`
        }))
      )

      // Calculate metrics
      const totalRevenue = paymentStats.payments.reduce((sum, p) => sum + p.amount, 0)
      const checkedInGuests = guestsData.guests.filter(g => g.status === "Checked In").length
      const checkedOutGuests = guestsData.guests.filter(g => g.status === "Checked Out").length
      
      setMetrics({
        totalRevenue,
        totalCheckIns: checkedInGuests,
        totalCheckOuts: checkedOutGuests,
        totalBookings: bookingsData.bookings.length,
        avgDailyRevenue: (totalRevenue / 11).toFixed(2), // 11 days in range
        currentOccupancy: `${((checkedInGuests / totalRooms) * 100).toFixed(0)}%`
      })

      // Set placeholder revenue data (would group by date in real implementation)
      setRevenueData([
        { date: "2026-03-11", checkIns: checkedInGuests, checkOuts: checkedOutGuests, revenue: totalRevenue, bookings: bookingsData.bookings.length }
      ])

      // Room type data
      const roomsByType = {}
      roomsData.rooms.forEach(room => {
        if (!roomsByType[room.type]) {
          roomsByType[room.type] = { count: 0, revenue: 0 }
        }
        roomsByType[room.type].count++
      })
      
      setRoomTypeData(
        Object.entries(roomsByType).map(([type, data]) => ({
          type,
          totalBookings: data.count,
          revenue: data.revenue,
          avgOccupancy: "N/A",
          roomCount: data.count
        }))
      )

    } catch (error) {
      console.error("Error fetching report data:", error)
      alert("Failed to load report data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    })
  }

  const setQuickRange = (range) => {
    const today = new Date("2026-03-11")
    let startDate = new Date(today)

    switch(range) {
      case "today":
        break
      case "week":
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate.setMonth(today.getMonth() - 1)
        break
      default:
        break
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
  }

  const exportToCSV = () => {
    let csv = ""
    
    if (selectedReport === "revenue") {
      csv = "Date,Check-Ins,Check-Outs,Revenue (GHS),Bookings\n"
      revenueData.forEach(row => {
        csv += `${row.date},${row.checkIns},${row.checkOuts},${row.revenue},${row.bookings}\n`
      })
    } else if (selectedReport === "roomtype") {
      csv = "Room Type,Total Bookings,Revenue (GHS),Avg Occupancy,Room Count\n"
      roomTypeData.forEach(row => {
        csv += `${row.type},${row.totalBookings},${row.revenue},${row.avgOccupancy},${row.roomCount}\n`
      })
    } else if (selectedReport === "payments") {
      csv = "Payment Method,Transactions,Amount (GHS)\n"
      paymentData.forEach(row => {
        csv += `${row.method},${row.transactions},${row.amount}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `${selectedReport}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Reports & Analytics</h1>
        </div>
      </div>

      {/* Date Range Selector */}
      <div style={styles.dateRangeSection}>
        <div style={styles.dateInputs}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.quickFilters}>
          <button onClick={() => setQuickRange("today")} style={styles.quickButton}>Today</button>
          <button onClick={() => setQuickRange("week")} style={styles.quickButton}>Last 7 Days</button>
          <button onClick={() => setQuickRange("month")} style={styles.quickButton}>Last 30 Days</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Total Revenue</p>
            <h2 style={styles.summaryValue}>GHS {Number(metrics.totalRevenue || 0).toFixed(2)}</h2>
            <p style={styles.summarySubtext}>Avg: GHS {metrics.avgDailyRevenue || 0}/day</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🚪</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Check-Ins</p>
            <h2 style={styles.summaryValue}>{metrics.totalCheckIns || 0}</h2>
            <p style={styles.summarySubtext}>Total arrivals</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🏃</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Check-Outs</p>
            <h2 style={styles.summaryValue}>{metrics.totalCheckOuts || 0}</h2>
            <p style={styles.summarySubtext}>Total departures</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📝</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Bookings</p>
            <h2 style={styles.summaryValue}>{metrics.totalBookings || 0}</h2>
            <p style={styles.summarySubtext}>New reservations</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div style={styles.summaryContent}>
            <p style={styles.summaryLabel}>Occupancy Rate</p>
            <h2 style={styles.summaryValue}>{metrics.currentOccupancy || "0%"}</h2>
            <p style={styles.summarySubtext}>{occupancyData.find(o => o.status === "Occupied")?.count || 0} of {occupancyData.reduce((s, o) => s + (o.count || 0), 0)} rooms</p>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div style={styles.reportTypeSection}>
        <button
          onClick={() => setSelectedReport("overview")}
          style={{
            ...styles.reportTypeButton,
            ...(selectedReport === "overview" ? styles.reportTypeButtonActive : {})
          }}
        >
          📈 Overview
        </button>
        <button
          onClick={() => setSelectedReport("revenue")}
          style={{
            ...styles.reportTypeButton,
            ...(selectedReport === "revenue" ? styles.reportTypeButtonActive : {})
          }}
        >
          💰 Revenue
        </button>
        <button
          onClick={() => setSelectedReport("occupancy")}
          style={{
            ...styles.reportTypeButton,
            ...(selectedReport === "occupancy" ? styles.reportTypeButtonActive : {})
          }}
        >
          🏨 Occupancy
        </button>
        <button
          onClick={() => setSelectedReport("roomtype")}
          style={{
            ...styles.reportTypeButton,
            ...(selectedReport === "roomtype" ? styles.reportTypeButtonActive : {})
          }}
        >
          🛏️ Room Types
        </button>
        <button
          onClick={() => setSelectedReport("payments")}
          style={{
            ...styles.reportTypeButton,
            ...(selectedReport === "payments" ? styles.reportTypeButtonActive : {})
          }}
        >
          💳 Payments
        </button>
      </div>

      {/* Report Content */}
      <div style={styles.reportContent}>
        {loading ? (
          <div style={styles.loadingMessage}>
            <p>Loading report data...</p>
          </div>
        ) : (
        <>
        {/* Overview Report */}
        {selectedReport === "overview" && (
          <div>
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>Overview Report</h2>
              <p style={styles.reportSubtitle}>
                Period: {dateRange.startDate} to {dateRange.endDate}
              </p>
            </div>

            <div style={styles.overviewGrid}>
              {/* Revenue Summary */}
              <div style={styles.overviewCard}>
                <h3 style={styles.overviewCardTitle}>💰 Revenue Summary</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Total Revenue:</span>
                    <span style={styles.overviewStatValue}>GHS {metrics.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Average per Day:</span>
                    <span style={styles.overviewStatValue}>GHS {metrics.avgDailyRevenue}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Highest Day:</span>
                    <span style={styles.overviewStatValue}>GHS 1450.00</span>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div style={styles.overviewCard}>
                <h3 style={styles.overviewCardTitle}>🚪 Activity Summary</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Total Check-Ins:</span>
                    <span style={styles.overviewStatValue}>{metrics.totalCheckIns}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Total Check-Outs:</span>
                    <span style={styles.overviewStatValue}>{metrics.totalCheckOuts}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>New Bookings:</span>
                    <span style={styles.overviewStatValue}>{metrics.totalBookings}</span>
                  </div>
                </div>
              </div>

              {/* Top Performing Room */}
              <div style={styles.overviewCard}>
                <h3 style={styles.overviewCardTitle}>⭐ Top Performer</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Room Type:</span>
                    <span style={styles.overviewStatValue}>AC Room</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Bookings:</span>
                    <span style={styles.overviewStatValue}>12</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Revenue:</span>
                    <span style={styles.overviewStatValue}>GHS 3,600.00</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div style={styles.overviewCard}>
                <h3 style={styles.overviewCardTitle}>📊 Current Status</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Occupied Rooms:</span>
                    <span style={styles.overviewStatValue}>{occupancyData.find(o => o.status === "Occupied")?.count || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Available Rooms:</span>
                    <span style={styles.overviewStatValue}>{occupancyData.find(o => o.status === "Available")?.count || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewStatLabel}>Occupancy Rate:</span>
                    <span style={styles.overviewStatValue}>{metrics.currentOccupancy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Report */}
        {selectedReport === "revenue" && (
          <div>
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>Revenue Report</h2>
              <button onClick={exportToCSV} style={styles.exportButton}>
                📥 Export CSV
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Check-Ins</th>
                    <th style={styles.th}>Check-Outs</th>
                    <th style={styles.th}>Bookings</th>
                    <th style={styles.th}>Revenue (GHS)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((row, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}>{row.date}</td>
                      <td style={styles.td}>{row.checkIns}</td>
                      <td style={styles.td}>{row.checkOuts}</td>
                      <td style={styles.td}>{row.bookings}</td>
                      <td style={{...styles.td, fontWeight: "600", color: "#16a34a"}}>
                        GHS {row.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{...styles.tableRow, backgroundColor: "#f3f4f6", fontWeight: "600"}}>
                    <td style={styles.td}>TOTAL</td>
                    <td style={styles.td}>{totalCheckIns}</td>
                    <td style={styles.td}>{totalCheckOuts}</td>
                    <td style={styles.td}>{totalBookings}</td>
                    <td style={{...styles.td, color: "#16a34a", fontSize: "1.1rem"}}>
                      GHS {totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Occupancy Report */}
        {selectedReport === "occupancy" && (
          <div>
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>Occupancy Report</h2>
            </div>
            <div style={styles.occupancyGrid}>
              {occupancyData.map((item, index) => (
                <div key={index} style={styles.occupancyCard}>
                  <h3 style={styles.occupancyStatus}>{item.status}</h3>
                  <div style={styles.occupancyCount}>{item.count}</div>
                  <div style={styles.occupancyPercentage}>{item.percentage}</div>
                  <div style={styles.occupancyBar}>
                    <div
                      style={{
                        ...styles.occupancyBarFill,
                        width: item.percentage,
                        backgroundColor: getOccupancyColor(item.status)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.occupancyInfo}>
              <p style={styles.occupancyText}>
                <strong>Total Rooms:</strong> 20 | <strong>Occupied:</strong> 7 (35%) | 
                <strong> Available:</strong> 9 (45%) | <strong>Reserved:</strong> 3 (15%)
              </p>
            </div>
          </div>
        )}

        {/* Room Type Performance Report */}
        {selectedReport === "roomtype" && (
          <div>
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>Room Type Performance</h2>
              <button onClick={exportToCSV} style={styles.exportButton}>
                📥 Export CSV
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Room Type</th>
                    <th style={styles.th}>Room Count</th>
                    <th style={styles.th}>Total Bookings</th>
                    <th style={styles.th}>Avg Occupancy</th>
                    <th style={styles.th}>Revenue (GHS)</th>
                    <th style={styles.th}>Revenue per Room</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypeData.map((row, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}><strong>{row.type}</strong></td>
                      <td style={styles.td}>{row.roomCount}</td>
                      <td style={styles.td}>{row.totalBookings}</td>
                      <td style={styles.td}>{row.avgOccupancy}</td>
                      <td style={{...styles.td, fontWeight: "600", color: "#16a34a"}}>
                        GHS {row.revenue.toFixed(2)}
                      </td>
                      <td style={styles.td}>
                        GHS {(row.revenue / row.roomCount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{...styles.tableRow, backgroundColor: "#f3f4f6", fontWeight: "600"}}>
                    <td style={styles.td}>TOTAL</td>
                    <td style={styles.td}>20</td>
                    <td style={styles.td}>
                      {roomTypeData.reduce((sum, row) => sum + row.totalBookings, 0)}
                    </td>
                    <td style={styles.td}>-</td>
                    <td style={{...styles.td, color: "#16a34a", fontSize: "1.1rem"}}>
                      GHS {roomTypeData.reduce((sum, row) => sum + row.revenue, 0).toFixed(2)}
                    </td>
                    <td style={styles.td}>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Methods Report */}
        {selectedReport === "payments" && (
          <div>
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>Payment Methods Report</h2>
              <button onClick={exportToCSV} style={styles.exportButton}>
                📥 Export CSV
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Payment Method</th>
                    <th style={styles.th}>Transactions</th>
                    <th style={styles.th}>Amount (GHS)</th>
                    <th style={styles.th}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.map((row, index) => {
                    const totalAmount = paymentData.reduce((sum, p) => sum + p.amount, 0)
                    const percentage = ((row.amount / totalAmount) * 100).toFixed(1)
                    return (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}><strong>{row.method}</strong></td>
                        <td style={styles.td}>{row.transactions}</td>
                        <td style={{...styles.td, fontWeight: "600", color: "#16a34a"}}>
                          GHS {row.amount.toFixed(2)}
                        </td>
                        <td style={styles.td}>{percentage}%</td>
                      </tr>
                    )
                  })}
                  <tr style={{...styles.tableRow, backgroundColor: "#f3f4f6", fontWeight: "600"}}>
                    <td style={styles.td}>TOTAL</td>
                    <td style={styles.td}>
                      {paymentData.reduce((sum, row) => sum + row.transactions, 0)}
                    </td>
                    <td style={{...styles.td, color: "#16a34a", fontSize: "1.1rem"}}>
                      GHS {paymentData.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}
                    </td>
                    <td style={styles.td}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}

function getOccupancyColor(status) {
  switch(status) {
    case "Occupied": return "#dc2626"
    case "Available": return "#16a34a"
    case "Reserved": return "#eab308"
    case "Cleaning": return "#3b82f6"
    case "Maintenance": return "#6b7280"
    default: return "#6b7280"
  }
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
  dateRangeSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  dateInputs: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    color: "#1f2937",
  },
  quickFilters: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  quickButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "1px solid #3b82f6",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
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
    margin: "0 0 0.25rem 0",
    color: "#1f2937",
  },
  summarySubtext: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    margin: 0,
  },
  reportTypeSection: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  reportTypeButton: {
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
  reportTypeButtonActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
    fontWeight: "700",
  },
  reportContent: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  reportTitle: {
    fontSize: "1.5rem",
    margin: 0,
    color: "#1f2937",
    fontWeight: "700",
  },
  reportSubtitle: {
    fontSize: "0.9rem",
    color: "#4b5563",
    margin: "0.5rem 0 0 0",
    fontWeight: "500",
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
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "1rem",
    color: "#1f2937",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  overviewCard: {
    backgroundColor: "#f9fafb",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  overviewCardTitle: {
    fontSize: "1.1rem",
    margin: "0 0 1rem 0",
    color: "#1f2937",
    fontWeight: "700",
  },
  overviewStats: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  overviewStat: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overviewStatLabel: {
    fontSize: "0.9rem",
    color: "#4b5563",
    fontWeight: "500",
  },
  overviewStatValue: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1f2937",
  },
  occupancyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  occupancyCard: {
    backgroundColor: "#f9fafb",
    padding: "1.5rem",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },
  occupancyStatus: {
    fontSize: "1rem",
    margin: "0 0 0.75rem 0",
    color: "#1f2937",
    fontWeight: "700",
  },
  occupancyCount: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0.5rem 0",
  },
  occupancyPercentage: {
    fontSize: "1.1rem",
    color: "#4b5563",
    marginBottom: "1rem",
    fontWeight: "600",
  },
  occupancyBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  occupancyBarFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  occupancyInfo: {
    backgroundColor: "#f3f4f6",
    padding: "1rem",
    borderRadius: "6px",
    textAlign: "center",
  },
  occupancyText: {
    margin: 0,
    color: "#1f2937",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  loadingMessage: {
    textAlign: "center",
    padding: "3rem 2rem",
    fontSize: "1.1rem",
    color: "#6b7280",
  },
}

export default Reports
