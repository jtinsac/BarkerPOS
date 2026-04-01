import { useEffect, useState, useContext } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../context/UserContext.jsx";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";
import { AlertTriangle, TrendingUp, Package, DollarSign, ShoppingCart, Clock, BarChart } from "lucide-react";

export default function Dashboard() {
  const { role } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [weeklySales, setWeeklySales] = useState([]);
  const [mostSoldItems, setMostSoldItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [peakHours, setPeakHours] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, 3months, 6months
  const [periodSales, setPeriodSales] = useState(0);
  const [periodTransactionCount, setPeriodTransactionCount] = useState(0);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Helper function to get date range based on selected period
  const getDateRange = (period) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
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
        startDate.setDate(now.getDate() - 7);
    }
    
    return { startDate: startDate.getTime(), endDate: now.getTime() };
  };

  // Filter transactions by selected period
  const getFilteredTransactions = (period) => {
    const { startDate, endDate } = getDateRange(period);
    return transactions.filter(
      transaction => transaction.createdAt >= startDate && transaction.createdAt <= endDate
    );
  };

  useEffect(() => {
    // Listen to transactions
    const transactionsRef = ref(db, "transactions");
    const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setTransactions(transactionsArray);
      } else {
        setTransactions([]);
      }
    });

    // Listen to products
    const productsRef = ref(db, "products");
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeProducts();
    };
  }, []);

  // Calculate dashboard data
  useEffect(() => {
    if (transactions.length === 0 && products.length === 0) return;

    // Calculate today's sales
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const todayTransactions = transactions.filter(
      transaction => transaction.createdAt >= startOfDay && transaction.createdAt < endOfDay
    );
    const todayTotal = todayTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
    setTodaySales(todayTotal);

    // Calculate weekly sales (last 7 days)
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayTransactions = transactions.filter(
        transaction => transaction.createdAt >= dayStart && transaction.createdAt < dayEnd
      );
      const dayTotal = dayTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
      
      weeklyData.push({
        day: dayNames[date.getDay()],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: dayTotal,
        isToday: i === 0
      });
    }
    setWeeklySales(weeklyData);

    // Calculate most sold items for selected period
    const periodTransactions = getFilteredTransactions(selectedPeriod);
    const itemSales = {};
    periodTransactions.forEach(transaction => {
      if (transaction.items) {
        transaction.items.forEach(item => {
          if (itemSales[item.productId]) {
            itemSales[item.productId].quantity += item.quantity || 0;
            itemSales[item.productId].revenue += (item.price || 0) * (item.quantity || 0);
          } else {
            itemSales[item.productId] = {
              name: item.name,
              quantity: item.quantity || 0,
              revenue: (item.price || 0) * (item.quantity || 0)
            };
          }
        });
      }
    });
    
    const sortedItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setMostSoldItems(sortedItems);

    // Find out of stock items
    const lowStock = products.filter(product => product.stockStatus === "out-of-stock")
      .sort((a, b) => a.name.localeCompare(b.name));
    setLowStockItems(lowStock);

    // Calculate Average Order Value
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
    const aov = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    setAverageOrderValue(aov);

    // Calculate today's transaction count
    setTransactionCount(todayTransactions.length);

    // Calculate peak hours (group by hour)
    const hourlyData = {};
    transactions.forEach(transaction => {
      if (transaction.createdAt) {
        const hour = new Date(transaction.createdAt).getHours();
        const hourKey = `${hour}:00`;
        if (hourlyData[hourKey]) {
          hourlyData[hourKey].count += 1;
          hourlyData[hourKey].revenue += transaction.total || 0;
        } else {
          hourlyData[hourKey] = {
            hour: hourKey,
            count: 1,
            revenue: transaction.total || 0
          };
        }
      }
    });
    
    const sortedHours = Object.values(hourlyData)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setPeakHours(sortedHours);

    // Calculate revenue by category for selected period
    const categoryRevenue = {};
    
    periodTransactions.forEach(transaction => {
      if (transaction.items) {
        transaction.items.forEach(item => {
          // Find the product to get its category
          const product = products.find(p => p.id === item.productId);
          const category = product?.category || 'Uncategorized';
          const revenue = (item.price || 0) * (item.quantity || 0);
          if (categoryRevenue[category]) {
            categoryRevenue[category] += revenue;
          } else {
            categoryRevenue[category] = revenue;
          }
        });
      }
    });
    
    const sortedCategories = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    setRevenueByCategory(sortedCategories);

    // Calculate sales and transactions for selected period
    const selectedPeriodTransactions = selectedPeriod === 'today' 
      ? todayTransactions 
      : getFilteredTransactions(selectedPeriod);
    
    const selectedPeriodSales = selectedPeriodTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
    setPeriodSales(selectedPeriodSales);
    setPeriodTransactionCount(selectedPeriodTransactions.length);
  }, [transactions, products, selectedPeriod]);

  // Weekly sales chart component
  const WeeklySalesChart = () => {
    let chartData = [];
    const now = new Date();
    
    if (selectedPeriod === 'today') {
      // Show hourly data for today
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i).getTime();
        const hourEnd = hourStart + 60 * 60 * 1000;
        
        const hourTransactions = transactions.filter(
          transaction => transaction.createdAt >= hourStart && transaction.createdAt < hourEnd
        );
        const hourTotal = hourTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
        
        chartData.push({
          label: `${i}:00`,
          sales: hourTotal,
          isCurrent: i === now.getHours()
        });
      }
    } else if (selectedPeriod === 'week') {
      // Show daily data for last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        
        const dayTransactions = transactions.filter(
          transaction => transaction.createdAt >= dayStart && transaction.createdAt < dayEnd
        );
        const dayTotal = dayTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
        
        chartData.push({
          label: dayNames[date.getDay()],
          sublabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: dayTotal,
          isCurrent: i === 0
        });
      }
    } else if (selectedPeriod === 'month') {
      // Show weekly data for last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        
        const weekStartTime = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).getTime();
        const weekEndTime = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59).getTime();
        
        const weekTransactions = transactions.filter(
          transaction => transaction.createdAt >= weekStartTime && transaction.createdAt <= weekEndTime
        );
        const weekTotal = weekTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
        
        chartData.push({
          label: `Week ${4-i}`,
          sublabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          sales: weekTotal,
          isCurrent: i === 0
        });
      }
    } else if (selectedPeriod === '3months') {
      // Show monthly data for last 3 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.getTime();
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).getTime();
        
        const monthTransactions = transactions.filter(
          transaction => transaction.createdAt >= monthStart && transaction.createdAt <= monthEnd
        );
        const monthTotal = monthTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
        
        chartData.push({
          label: monthNames[monthDate.getMonth()],
          sublabel: monthDate.getFullYear().toString(),
          sales: monthTotal,
          isCurrent: i === 0
        });
      }
    } else if (selectedPeriod === '6months') {
      // Show monthly data for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.getTime();
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).getTime();
        
        const monthTransactions = transactions.filter(
          transaction => transaction.createdAt >= monthStart && transaction.createdAt <= monthEnd
        );
        const monthTotal = monthTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
        
        chartData.push({
          label: monthNames[monthDate.getMonth()],
          sublabel: monthDate.getFullYear().toString(),
          sales: monthTotal,
          isCurrent: i === 0
        });
      }
    }
    
    const maxSales = Math.max(...chartData.map(item => item.sales), 1);
    
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "end", gap: "0.5rem", height: "120px", marginBottom: "0.5rem" }}>
          {chartData.map((item, index) => {
            const height = (item.sales / maxSales) * 100;
            return (
              <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(height, 2)}%`,
                    background: item.isCurrent 
                      ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                      : "linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(16,185,129,0.6) 100%)",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 200ms ease",
                    position: "relative",
                    minHeight: "4px"
                  }}
                  title={`${item.label}${item.sublabel ? ` ${item.sublabel}` : ''}: ₱${item.sales.toLocaleString()}`}
                >
                  {item.sales > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "-1.5rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      color: "#374151",
                      whiteSpace: "nowrap"
                    }}>
                      ₱{item.sales.toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: item.isCurrent ? "#059669" : "#64748b" }}>
                  {item.label}
                </div>
                {item.sublabel && (
                  <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                    {item.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <MainLayout onLogout={handleLogout}>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "100%",
            color: "#64748b",
            fontSize: "1rem"
          }}>
            Loading dashboard data...
          </div>
        </MainLayout>
      </>
    );
  }

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
            .dashboardPage {
              background:
                radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%),
                radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%),
                radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%);
            }
            .dashboardCard { backdrop-filter: blur(6px); }
          `}</style>

          <div className="dashboardPage" style={{ 
            borderRadius: "18px", 
            padding: "1.5rem",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
                  Dashboard
                </div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
                  Welcome back — here's what's happening today.
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
                  Live
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
                  Connected
                </div>
              </div>
            </div>

            {/* Period Filter */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", marginRight: "0.5rem" }}>
                Analytics Period:
              </div>
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: '3months', label: '3 Months' },
                { key: '6months', label: '6 Months' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "10px",
                    border: selectedPeriod === period.key 
                      ? "1px solid rgba(59,130,246,0.5)" 
                      : "1px solid rgba(226, 232, 240, 0.8)",
                    background: selectedPeriod === period.key 
                      ? "rgba(59,130,246,0.15)" 
                      : "rgba(255,255,255,0.8)",
                    color: selectedPeriod === period.key ? "#1d4ed8" : "#64748b",
                    fontWeight: selectedPeriod === period.key ? 700 : 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 150ms ease"
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div
              className="dashboardCard"
              style={{
                background: "rgba(255,255,255,0.86)",
                border: "1px solid rgba(226, 232, 240, 0.85)",
                borderRadius: "14px",
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.5) inset",
                overflow: "auto",
                flex: "1",
                minHeight: 0,
                padding: "2rem"
              }}
            >
              {/* KPI Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "3rem"
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(226, 232, 240, 0.85)",
                    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <DollarSign size={18} style={{ color: "#059669" }} />
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 700 }}>
                      Sales {selectedPeriod === 'today' ? 'Today' : selectedPeriod === '3months' ? '3 Months' : selectedPeriod === '6months' ? '6 Months' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>
                    ₱{periodSales.toLocaleString()}
                  </div>
                  <div style={{ marginTop: "0.65rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(16,185,129,0.10)",
                        border: "1px solid rgba(16,185,129,0.35)",
                        color: "#047857",
                        fontWeight: 900,
                        fontSize: "0.82rem",
                      }}
                    >
                      Live
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(226, 232, 240, 0.85)",
                    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <ShoppingCart size={18} style={{ color: "#8b5cf6" }} />
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 700 }}>Avg Order Value</div>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>
                    ₱{averageOrderValue.toLocaleString()}
                  </div>
                  <div style={{ marginTop: "0.65rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(139,92,246,0.10)",
                        border: "1px solid rgba(139,92,246,0.35)",
                        color: "#7c3aed",
                        fontWeight: 900,
                        fontSize: "0.82rem",
                      }}
                    >
                      Per Sale
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(226, 232, 240, 0.85)",
                    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Package size={18} style={{ color: "#3b82f6" }} />
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 700 }}>
                      Transactions {selectedPeriod === 'today' ? 'Today' : selectedPeriod === '3months' ? '3 Months' : selectedPeriod === '6months' ? '6 Months' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>
                    {periodTransactionCount}
                  </div>
                  <div style={{ marginTop: "0.65rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(59,130,246,0.10)",
                        border: "1px solid rgba(59,130,246,0.35)",
                        color: "#1d4ed8",
                        fontWeight: 900,
                        fontSize: "0.82rem",
                      }}
                    >
                      Sales
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(226, 232, 240, 0.85)",
                    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <BarChart size={18} style={{ color: "#f59e0b" }} />
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 700 }}>Total Products</div>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>
                    {products.length}
                  </div>
                  <div style={{ marginTop: "0.65rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(245,158,11,0.10)",
                        border: "1px solid rgba(245,158,11,0.35)",
                        color: "#d97706",
                        fontWeight: 900,
                        fontSize: "0.82rem",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: selectedPeriod === 'today' ? "1fr" : "1fr 1fr", 
                gap: "2rem", 
                marginBottom: "3rem"
              }}>
                {/* Weekly Sales Chart - Only show for week and longer periods */}
                {selectedPeriod !== 'today' && (
                  <div style={{
                    background: "rgba(248, 250, 252, 0.8)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    borderRadius: "12px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                      padding: "1rem",
                      borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <TrendingUp size={18} style={{ color: "#059669" }} />
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                          {selectedPeriod === 'week' ? 'Weekly Sales' :
                           selectedPeriod === 'month' ? 'Monthly Sales by Week' :
                           selectedPeriod === '3months' ? '3-Month Sales by Month' :
                           '6-Month Sales by Month'}
                        </h3>
                      </div>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        {selectedPeriod === 'week' ? 'Last 7 days performance' :
                         selectedPeriod === 'month' ? 'Weekly breakdown for last month' :
                         selectedPeriod === '3months' ? 'Monthly breakdown for last 3 months' :
                         'Monthly breakdown for last 6 months'}
                      </p>
                    </div>
                    <WeeklySalesChart />
                  </div>
                )}

                {/* Most Sold Items */}
                <div style={{
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{
                    background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                    padding: "1rem",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Package size={18} style={{ color: "#3b82f6" }} />
                      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                        Top Selling Items
                      </h3>
                      <span style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        background: "rgba(59,130,246,0.15)",
                        color: "#1d4ed8",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "capitalize"
                      }}>
                        {selectedPeriod === '3months' ? '3 Months' : selectedPeriod === '6months' ? '6 Months' : selectedPeriod}
                      </span>
                    </div>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                      Most popular products in selected period
                    </p>
                  </div>
                  <div style={{ padding: "1rem", flex: "1", overflow: "auto" }}>
                    {mostSoldItems.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                        <div style={{ fontSize: "0.9rem" }}>No sales data yet</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {mostSoldItems.map((item, index) => (
                          <div key={index} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            border: "1px solid rgba(226, 232, 240, 0.6)"
                          }}>
                            <div style={{ flex: "1" }}>
                              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                ₱{item.revenue.toLocaleString()} revenue
                              </div>
                            </div>
                            <div style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "6px",
                              background: "rgba(59,130,246,0.10)",
                              border: "1px solid rgba(59,130,246,0.25)",
                              color: "#1d4ed8",
                              fontSize: "0.8rem",
                              fontWeight: "700"
                            }}>
                              {item.quantity} sold
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Analytics Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr", 
                gap: "2rem", 
                marginBottom: "3rem"
              }}>
                {/* Revenue by Category */}
                <div style={{
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{
                    background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                    padding: "1rem",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <BarChart size={18} style={{ color: "#f59e0b" }} />
                      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                        Revenue by Category
                      </h3>
                      <span style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        background: "rgba(245,158,11,0.15)",
                        color: "#d97706",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "capitalize"
                      }}>
                        {selectedPeriod === '3months' ? '3 Months' : selectedPeriod === '6months' ? '6 Months' : selectedPeriod}
                      </span>
                    </div>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                      Top performing categories in selected period
                    </p>
                  </div>
                  <div style={{ padding: "1rem", flex: "1", overflow: "auto" }}>
                    {revenueByCategory.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                        <div style={{ fontSize: "0.9rem" }}>No category data yet</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {revenueByCategory.map((category, index) => {
                          const maxRevenue = Math.max(...revenueByCategory.map(c => c.revenue), 1);
                          const percentage = (category.revenue / maxRevenue) * 100;
                          return (
                            <div key={index} style={{
                              padding: "0.75rem",
                              background: "rgba(255, 255, 255, 0.8)",
                              borderRadius: "8px",
                              border: "1px solid rgba(226, 232, 240, 0.6)"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                                  {category.category}
                                </div>
                                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#d97706" }}>
                                  ₱{category.revenue.toLocaleString()}
                                </div>
                              </div>
                              <div style={{
                                width: "100%",
                                height: "4px",
                                background: "rgba(226, 232, 240, 0.5)",
                                borderRadius: "2px",
                                overflow: "hidden"
                              }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: "100%",
                                  background: "linear-gradient(90deg, #f59e0b, #d97706)",
                                  borderRadius: "2px",
                                  transition: "width 0.3s ease"
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Out of Stock Alerts */}
              {lowStockItems.length > 0 && (
                <div style={{
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginTop: "1rem",
                  marginBottom: "2rem"
                }}>
                  <div style={{
                    background: "linear-gradient(90deg, rgba(239,68,68,0.16), rgba(245,101,101,0.12))",
                    padding: "1.5rem",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertTriangle size={18} style={{ color: "#dc2626" }} />
                      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                        Out of Stock Alert
                      </h3>
                    </div>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                      Items currently out of stock
                    </p>
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                      gap: "1rem" 
                    }}>
                      {lowStockItems.map((item, index) => (
                        <div key={index} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem",
                          background: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "8px",
                          border: "1px solid rgba(239,68,68,0.2)"
                        }}>
                          <div style={{ flex: "1" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {item.category || "No category"}
                            </div>
                          </div>
                          <div style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            background: "rgba(239,68,68,0.15)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#dc2626",
                            fontSize: "0.8rem",
                            fontWeight: "700"
                          }}>
                            Out of Stock
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}