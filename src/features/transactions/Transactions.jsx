import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../context/UserContext.jsx";
import { ChevronDown, ChevronRight } from "lucide-react";

const Transactions = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState(location.state?.filterPeriod || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = 10;

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    const transactionsRef = ref(db, "transactions");
    console.log("Setting up transactions listener...");

    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      console.log("Transactions snapshot received:", snapshot.exists());
      const data = snapshot.val();
      console.log("Raw transactions data:", data);

      if (!data) {
        console.log("No transactions data found");
        setTransactions([]);
        return;
      }

      const transactionsArray = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      console.log("Processed transactions array:", transactionsArray);
      console.log("Number of transactions:", transactionsArray.length);
      setTransactions(transactionsArray);
    }, (error) => {
      console.error("Error listening to transactions:", error);
    });

    return () => {
      console.log("Cleaning up transactions listener");
      unsubscribe();
    };
  }, []);

  // Helper function to get date range based on period
  const getDateRange = (period) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        return { startDate: startDate.getTime(), endDate: now.getTime() };
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        return null;
    }
    
    return { startDate: startDate.getTime(), endDate: now.getTime() };
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.items?.some(item => 
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesDate = !dateFilter || 
        new Date(transaction.createdAt).toDateString() === new Date(dateFilter).toDateString();
      
      // Apply period filter if set
      let matchesPeriod = true;
      if (periodFilter) {
        const dateRange = getDateRange(periodFilter);
        if (dateRange) {
          matchesPeriod = transaction.createdAt >= dateRange.startDate && transaction.createdAt <= dateRange.endDate;
        }
      }
      
      return matchesSearch && matchesDate && matchesPeriod;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return b.createdAt - a.createdAt;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleRowExpansion = (transactionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const calculateTodayRevenue = () => {
    const today = new Date();
    const todayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate.toDateString() === today.toDateString();
    });
    return todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  };

  return (
    <>
      <Header />
      <MainLayout onLogout={handleLogout}>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily:
              'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
          }}
        >
          <style>{`
            .transactionsPage {
              background:
                radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%),
                radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%),
                radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%);
            }
            .transactionsCard { backdrop-filter: blur(6px); }
          `}</style>

          <div className="transactionsPage" style={{ 
            borderRadius: "18px", 
            padding: "1rem",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
                  Transaction History
                </div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
                  View and manage all sales transactions
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(59,130,246,0.35)",
                    background: "rgba(59,130,246,0.10)",
                    color: "#1d4ed8",
                    fontWeight: 900,
                  }}
                >
                  {filteredTransactions.length} Transactions
                </div>
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(16,185,129,0.35)",
                    background: "rgba(16,185,129,0.10)",
                    color: "#047857",
                    fontWeight: 900,
                  }}
                >
                  ₱{calculateTodayRevenue().toLocaleString()} Today
                </div>
              </div>
            </div>

            <div
              className="transactionsCard"
              style={{
                background: "rgba(255,255,255,0.86)",
                border: "1px solid rgba(226, 232, 240, 0.85)",
                borderRadius: "14px",
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.5) inset",
                overflow: "hidden",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {/* Header with Search and Sort */}
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                  padding: "1.25rem",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Period Filter */}
                  {periodFilter && (
                    <div style={{
                      padding: "0.65rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(59,130,246,0.5)",
                      background: "rgba(59,130,246,0.15)",
                      color: "#1d4ed8",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <span>Filtered by: {periodFilter === '3months' ? '3 Months' : periodFilter === '6months' ? '6 Months' : periodFilter.charAt(0).toUpperCase() + periodFilter.slice(1)}</span>
                      <button
                        onClick={() => {
                          setPeriodFilter("");
                          setCurrentPage(1);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#1d4ed8",
                          cursor: "pointer",
                          fontSize: "1rem",
                          padding: "0",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div style={{ flex: "1", minWidth: "250px" }}>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by user, transaction ID, or product..."
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.8rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(226, 232, 240, 0.9)",
                        background: "rgba(255,255,255,0.9)",
                        fontSize: "0.95rem",
                        color: "#0f172a",
                        outline: "none",
                        transition: "all 120ms ease"
                      }}
                    />
                  </div>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "0.65rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      background: "rgba(255,255,255,0.9)",
                      fontSize: "0.95rem",
                      color: "#0f172a",
                      outline: "none",
                      cursor: "pointer",
                      minWidth: "150px"
                    }}
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "0.65rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      background: "rgba(255,255,255,0.9)",
                      fontSize: "0.95rem",
                      color: "#0f172a",
                      outline: "none",
                      cursor: "pointer",
                      minWidth: "150px"
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div style={{ flex: "1", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {paginatedTransactions.length === 0 ? (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "3rem", 
                    color: "#64748b",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: "1"
                  }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      No transactions found
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      {searchQuery ? "Try adjusting your search criteria" : "No transactions have been recorded yet"}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: "1", overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(248, 250, 252, 0.8)", borderBottom: "1px solid rgba(226, 232, 240, 0.8)" }}>
                          <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em", width: "40px" }}>
                            {/* Expand column */}
                          </th>
                          <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em" }}>
                            DATE & TIME
                          </th>
                          <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em" }}>
                            CASHIER
                          </th>
                          <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em" }}>
                            PAYMENT METHOD
                          </th>
                          <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em" }}>
                            ITEMS
                          </th>
                          <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.85rem", fontWeight: "700", color: "#374151", letterSpacing: "0.05em" }}>
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map((transaction, index) => {
                          const isExpanded = expandedRows.has(transaction.id);
                          return (
                            <React.Fragment key={transaction.id}>
                              <tr 
                                style={{ 
                                  borderBottom: isExpanded ? "none" : "1px solid rgba(226, 232, 240, 0.6)",
                                  background: index % 2 === 0 ? "rgba(248, 250, 252, 0.3)" : "transparent"
                                }}
                              >
                                <td style={{ padding: "1rem" }}>
                                  <button
                                    onClick={() => toggleRowExpansion(transaction.id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "0.25rem",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#64748b",
                                      transition: "all 150ms ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "rgba(248, 250, 252, 0.8)";
                                      e.target.style.color = "#374151";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "none";
                                      e.target.style.color = "#64748b";
                                    }}
                                  >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                  </button>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                  <div style={{ fontSize: "0.9rem", color: "#374151" }}>
                                    {formatDate(transaction.createdAt)}
                                  </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                                    {transaction.userName || "Unknown"}
                                  </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                  <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.4rem 0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    background: transaction.paymentMethod === "gcash" 
                                      ? "rgba(59, 130, 246, 0.1)" 
                                      : "rgba(34, 197, 94, 0.1)",
                                    border: transaction.paymentMethod === "gcash" 
                                      ? "1px solid rgba(59, 130, 246, 0.2)" 
                                      : "1px solid rgba(34, 197, 94, 0.2)",
                                    color: transaction.paymentMethod === "gcash" 
                                      ? "#1d4ed8" 
                                      : "#047857"
                                  }}>
                                    <span>
                                      {transaction.paymentMethod === "gcash" ? "📱" : "💵"}
                                    </span>
                                    <span>
                                      {transaction.paymentMethod === "gcash" ? "GCash" : "Cash"}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                    {transaction.items?.length || 0} item{(transaction.items?.length || 0) !== 1 ? 's' : ''}
                                  </div>
                                  {!isExpanded && (
                                    <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                                      {transaction.items?.slice(0, 2).map(item => item.name).join(', ')}
                                      {(transaction.items?.length || 0) > 2 && ` +${transaction.items.length - 2} more`}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#059669" }}>
                                    ₱{transaction.total?.toLocaleString() || "0"}
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr style={{ 
                                  borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
                                  background: index % 2 === 0 ? "rgba(248, 250, 252, 0.3)" : "transparent"
                                }}>
                                  <td colSpan="6" style={{ padding: "0 1rem 1rem 1rem" }}>
                                    <div style={{
                                      background: "rgba(255, 255, 255, 0.8)",
                                      border: "1px solid rgba(226, 232, 240, 0.6)",
                                      borderRadius: "8px",
                                      padding: "1rem",
                                      marginLeft: "2rem"
                                    }}>
                                      <div style={{ 
                                        fontSize: "0.9rem", 
                                        fontWeight: "600", 
                                        color: "#374151", 
                                        marginBottom: "0.75rem",
                                        borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
                                        paddingBottom: "0.5rem"
                                      }}>
                                        Items Purchased:
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {transaction.items?.map((item, itemIndex) => (
                                          <div key={itemIndex} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.5rem 0",
                                            borderBottom: itemIndex < transaction.items.length - 1 ? "1px solid rgba(226, 232, 240, 0.4)" : "none"
                                          }}>
                                            <div style={{ flex: "1" }}>
                                              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                                                {item.name}
                                              </div>
                                              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                ₱{item.price?.toLocaleString()} × {item.quantity}
                                              </div>
                                            </div>
                                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#059669" }}>
                                              ₱{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                            </div>
                                          </div>
                                        )) || []}
                                      </div>
                                      <div style={{
                                        marginTop: "0.75rem",
                                        paddingTop: "0.75rem",
                                        borderTop: "2px solid rgba(226, 232, 240, 0.8)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                      }}>
                                        <span style={{ fontSize: "1rem", fontWeight: "700", color: "#374151" }}>
                                          Total:
                                        </span>
                                        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#059669" }}>
                                          ₱{transaction.total?.toLocaleString() || "0"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      borderTop: "1px solid rgba(226, 232, 240, 0.8)",
                      background: "rgba(248, 250, 252, 0.5)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem"
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(226, 232, 240, 0.8)",
                          background: currentPage === 1 ? "rgba(248, 250, 252, 0.5)" : "rgba(255,255,255,0.9)",
                          color: currentPage === 1 ? "#9ca3af" : "#374151",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          transition: "all 150ms ease"
                        }}
                      >
                        Previous
                      </button>
                      
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(226, 232, 240, 0.8)",
                                background: currentPage === pageNum 
                                  ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                                  : "rgba(255,255,255,0.9)",
                                color: currentPage === pageNum ? "white" : "#374151",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 150ms ease"
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(226, 232, 240, 0.8)",
                          background: currentPage === totalPages ? "rgba(248, 250, 252, 0.5)" : "rgba(255,255,255,0.9)",
                          color: currentPage === totalPages ? "#9ca3af" : "#374151",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          transition: "all 150ms ease"
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Transactions;