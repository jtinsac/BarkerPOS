import React, { useEffect, useState, useContext } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";
import Header from "../../components/layout/Header.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../context/UserContext.jsx";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CashierSales = () => {
  const { user, userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [cups, setCups] = useState({ "8oz": 0, "16oz": 0, "22oz": 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    const transactionsRef = ref(db, "transactions");
    const cupsRef = ref(db, "cups");

    const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setTransactions([]);
        return;
      }

      const transactionsArray = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setTransactions(transactionsArray);
    }, (error) => {
      console.error("Error listening to transactions:", error);
    });

    const unsubscribeCups = onValue(cupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCups(data);
      } else {
        setCups({ "8oz": 0, "16oz": 0, "22oz": 0 });
      }
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeCups();
    };
  }, []);

  // Filter transactions to only show today's transactions and sort by newest first
  const todayTransactions = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      // Use Manila timezone for comparison
      const todayInManila = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      const transactionInManila = transactionDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      return transactionInManila === todayInManila;
    })
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)); // Sort by newest first

  // Filter today's transactions based on search query
  const filteredTodayTransactions = todayTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.items?.some(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesSearch;
  });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
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
    return todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: "80px", height: "100vh", overflow: "hidden" }}>
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
            .salesPage {
              background:
                radial-gradient(900px 500px at 10% 0%, rgba(139,69,19,0.18), transparent 60%),
                radial-gradient(900px 500px at 90% 10%, rgba(160,82,45,0.14), transparent 55%),
                radial-gradient(900px 500px at 50% 100%, rgba(210,105,30,0.10), transparent 55%);
            }
            .salesCard { backdrop-filter: blur(6px); }
          `}</style>

          <div className="salesPage" style={{ 
            borderRadius: "18px", 
            padding: "1rem",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={() => navigate('/pos')}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#6b7280",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.12)";
                    e.target.style.background = "rgba(255, 255, 255, 1)";
                    e.target.style.color = "#8B4513";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.08)";
                    e.target.style.background = "rgba(255, 255, 255, 0.95)";
                    e.target.style.color = "#6b7280";
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
                    Today's Sales
                  </div>
                  <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
                    View your sales transactions for today
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(139,69,19,0.35)",
                    background: "rgba(139,69,19,0.10)",
                    color: "#8B4513",
                    fontWeight: 900,
                  }}
                >
                  {filteredTodayTransactions.length} Sales Today
                </div>
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(160,82,45,0.35)",
                    background: "rgba(160,82,45,0.10)",
                    color: "#A0522D",
                    fontWeight: 900,
                  }}
                >
                  ₱{calculateTodayRevenue().toLocaleString()} Revenue
                </div>
                {/* Cup Counter Display */}
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(210,105,30,0.35)",
                    background: "rgba(210,105,30,0.10)",
                    color: "#D2691E",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <span>☕</span>
                  <span>Cups: {Object.values(cups).reduce((total, count) => total + count, 0)}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>({cups["8oz"]}×8oz, {cups["16oz"]}×16oz, {cups["22oz"]}×22oz)</span>
                </div>
              </div>
            </div>

            <div
              className="salesCard"
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
              {/* Search Bar */}
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(139,69,19,0.16), rgba(160,82,45,0.12))",
                  padding: "1.25rem",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: "1" }}>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by cashier name, transaction ID, or product..."
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
                </div>
              </div>

              {/* Transactions Table */}
              <div style={{ flex: "1", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {filteredTodayTransactions.length === 0 ? (
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
                      No sales found for today
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      {searchQuery ? "No transactions found matching your search" : "No transactions have been recorded today"}
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
                            TIME
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
                        {filteredTodayTransactions.map((transaction, index) => {
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
                                  <div style={{ fontSize: "0.9rem", color: "#374151", fontWeight: "600" }}>
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
                                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#8B4513" }}>
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
                                        Items Sold:
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
                                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#8B4513" }}>
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
                                        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#8B4513" }}>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CashierSales;