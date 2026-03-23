import { useEffect, useState, useContext } from "react";
import { ref, onValue, push, update, get } from "firebase/database";
import { db, auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { UserContext } from "../../context/UserContext.jsx";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";

// Custom Confirmation Modal Component
const CheckoutConfirmationModal = ({ cart, total, onConfirm, onCancel, isProcessing }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        backdropFilter: "blur(4px)"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "hidden",
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
            padding: "1.25rem",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em"
            }}
          >
            Confirm Checkout
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "rgba(248, 250, 252, 0.8)",
              borderRadius: "10px",
              border: "1px solid rgba(226, 232, 240, 0.8)"
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: "0.75rem",
                fontSize: "0.95rem"
              }}
            >
              Order Summary:
            </div>
            
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {cart.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem"
                  }}
                >
                  <span style={{ color: "#374151" }}>
                    {item.name} (x{item.quantity})
                  </span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div
              style={{
                borderTop: "1px solid rgba(226, 232, 240, 0.8)",
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "1rem"
                }}
              >
                Total:
              </span>
              <span
                style={{
                  fontWeight: 800,
                  color: "#059669",
                  fontSize: "1.1rem"
                }}
              >
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              textAlign: "center",
              marginBottom: "1.5rem"
            }}
          >
            Are you sure you want to process this transaction?
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end"
            }}
          >
            <button
              onClick={onCancel}
              style={{
                background: "rgba(248, 250, 252, 0.8)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: "12px",
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#64748b",
                cursor: "pointer",
                transition: "all 150ms ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(241, 245, 249, 0.9)";
                e.target.style.borderColor = "rgba(203, 213, 225, 0.9)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(248, 250, 252, 0.8)";
                e.target.style.borderColor = "rgba(226, 232, 240, 0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              style={{
                background: isProcessing 
                  ? "rgba(156, 163, 175, 0.2)" 
                  : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "0.75rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: isProcessing ? "#9ca3af" : "white",
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
                boxShadow: isProcessing 
                  ? "none" 
                  : "0 4px 12px rgba(5, 150, 105, 0.3)",
                opacity: isProcessing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(5, 150, 105, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(5, 150, 105, 0.3)";
                }
              }}
            >
              {isProcessing ? "Processing..." : "Process Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        background: type === "success" 
          ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
          : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        color: "white",
        fontSize: "0.95rem",
        fontWeight: "600",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        animation: "slideIn 0.3s ease-out",
        minWidth: "300px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        fontWeight: "800"
      }}>
        {type === "success" ? "✓" : "✕"}
      </div>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.2rem",
          cursor: "pointer",
          marginLeft: "auto",
          opacity: 0.8,
          transition: "opacity 0.2s ease"
        }}
      >
        ×
      </button>
    </div>
  );
};

const POS = () => {
  const { role, user, userData } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

const handleCheckout = async () => {
  if (cart.length === 0) return;
  setShowCheckoutModal(true);
};

const processCheckout = async () => {
  setIsProcessingCheckout(true);
  setShowCheckoutModal(false);
  
  try {
    const currentUser = auth.currentUser;

    const transactionRef = ref(db, "transactions");

    // Create transaction object
    const newTransaction = {
      createdAt: Date.now(),
      userId: currentUser.uid,
      userName: userData?.name || "Unknown User",
      total,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    await push(transactionRef, newTransaction);

    const updates = {};

    for (let item of cart) {
      const productRef = ref(db, `products/${item.id}`);
      const snapshot = await get(productRef);

      if (snapshot.exists()) {
        const currentStock = snapshot.val().stock || 0;
        const newStock = currentStock - item.quantity;

        updates[`products/${item.id}/stock`] = newStock < 0 ? 0 : newStock;
      }
    }

    await update(ref(db), updates);

    clearCart();

    setToast({ message: "Transaction completed successfully!", type: "success" });
  
  } catch(error) {
    console.error("Checkout error:", error);
    setToast({ message: "Checkout failed. Please try again.", type: "error" });
  } finally {
    setIsProcessingCheckout(false);
  }
};

  useEffect(() => {
    const productsRef = ref(db, "products");

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setProducts([]);
        return;
      }

      const productsArray = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setProducts(productsArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products based on search and category (include out of stock items)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const posContent = (
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
        .posPage {
          background:
            radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%),
            radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%);
        }
        .posCard { backdrop-filter: blur(6px); }
      `}</style>

      <div className="posPage" style={{ 
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
              Point of Sale
            </div>
            <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
              Select products and manage your cart
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
              {filteredProducts.length} Products
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
              Cart ({cart.length})
            </div>
          </div>
        </div>

        <div
          className="posCard"
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
            padding: "1.25rem"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: "1.5rem",
              flex: "1",
              overflow: "hidden",
              minHeight: 0
            }}
          >
            {/* LEFT SIDE - Products */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflow: "hidden"
              }}
            >
              {/* Search and Filter Bar */}
              <div
                style={{
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  padding: "1rem",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Search Bar */}
                  <div style={{ flex: "1", minWidth: "250px" }}>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
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

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div
                style={{
                  flex: "1",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0
                }}
              >
                {filteredProducts.length === 0 ? (
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
                      No products found
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      Try adjusting your search or filter criteria
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gridAutoRows: "280px",
                      gap: "1rem",
                      overflow: "auto",
                      flex: "1",
                      paddingRight: "0.5rem",
                      alignContent: "start"
                    }}
                  >
                    {filteredProducts.map((product) => {
                      const stockValue = Number(product.stock) || 0;
                      const isOutOfStock = stockValue <= 0;
                      
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isOutOfStock) {
                              addToCart(product);
                            }
                          }}
                          disabled={isOutOfStock}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "0",
                            borderRadius: "12px",
                            border: `1px solid ${isOutOfStock ? "rgba(156, 163, 175, 0.4)" : "rgba(226, 232, 240, 0.8)"}`,
                            background: isOutOfStock ? "rgba(243, 244, 246, 0.6)" : "rgba(248, 250, 252, 0.6)",
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            transition: "all 150ms ease",
                            textAlign: "left",
                            height: "280px",
                            justifyContent: "flex-start",
                            opacity: isOutOfStock ? 0.6 : 1,
                            pointerEvents: isOutOfStock ? "none" : "auto",
                            overflow: "hidden"
                          }}
                        >
                          {/* Image Container - Fixed Height */}
                          <div style={{ 
                            width: "100%", 
                            height: "140px", 
                            borderRadius: "12px 12px 0 0",
                            overflow: "hidden",
                            background: "rgba(226, 232, 240, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  opacity: isOutOfStock ? 0.5 : 1,
                                  padding: "0.25rem"
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #9ca3af; font-size: 2.5rem;">📦</div>';
                                }}
                              />
                            ) : (
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                color: "#9ca3af",
                                fontSize: "2.5rem"
                              }}>
                                📦
                              </div>
                            )}
                          </div>
                          
                          {/* Content Container */}
                          <div style={{ 
                            flex: "1", 
                            padding: "1rem", 
                            display: "flex", 
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: 0
                          }}>
                            {/* Product Info */}
                            <div style={{ flex: "1", overflow: "hidden" }}>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: "700",
                                  color: isOutOfStock ? "#9ca3af" : "#0f172a",
                                  marginBottom: "0.5rem",
                                  lineHeight: "1.2",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  height: "2.4rem"
                                }}
                              >
                                {product.name}
                              </div>
                              
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "flex-start" }}>
                                {product.category && (
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: isOutOfStock ? "#9ca3af" : "#64748b",
                                      background: isOutOfStock ? "rgba(156, 163, 175, 0.3)" : "rgba(226, 232, 240, 0.5)",
                                      padding: "0.2rem 0.5rem",
                                      borderRadius: "6px",
                                      display: "inline-block"
                                    }}
                                  >
                                    {product.category}
                                  </div>
                                )}
                                {isOutOfStock && (
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "#dc2626",
                                      background: "rgba(239, 68, 68, 0.1)",
                                      border: "1px solid rgba(239, 68, 68, 0.2)",
                                      padding: "0.2rem 0.5rem",
                                      borderRadius: "6px",
                                      display: "inline-block",
                                      fontWeight: "600",
                                      flexShrink: 0
                                    }}
                                  >
                                    Out of Stock
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Price and Stock */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", flexShrink: 0 }}>
                              <span
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "800",
                                  color: isOutOfStock ? "#9ca3af" : "#059669"
                                }}
                              >
                                ₱{Number(product.price).toLocaleString()}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: isOutOfStock ? "#dc2626" : "#64748b",
                                  fontWeight: "500"
                                }}
                              >
                                Stock: {stockValue}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - Cart */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflow: "hidden"
              }}
            >
              {/* Cart Header */}
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  padding: "1rem",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Cart ({cart.length})
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.1)",
                        color: "#dc2626",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 150ms ease"
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div
                style={{
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  flex: "1",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ 
                  flex: "1", 
                  overflow: "auto", 
                  padding: "1rem",
                  minHeight: 0
                }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Cart is empty
                      </div>
                      <div style={{ fontSize: "0.9rem" }}>
                        Add products to get started
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "0.75rem",
                      paddingRight: "0.5rem"
                    }}>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "10px",
                            border: "1px solid rgba(226, 232, 240, 0.6)"
                          }}
                        >
                          <div style={{ flex: "1" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              ₱{Number(item.price).toLocaleString()} each
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                border: "1px solid rgba(226, 232, 240, 0.8)",
                                background: "rgba(248, 250, 252, 0.8)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: "#64748b"
                              }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: "0.9rem", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                border: "1px solid rgba(226, 232, 240, 0.8)",
                                background: "rgba(248, 250, 252, 0.8)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: "#64748b"
                              }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                border: "1px solid rgba(239,68,68,0.3)",
                                background: "rgba(239,68,68,0.1)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: "#dc2626",
                                marginLeft: "0.25rem"
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Total and Checkout */}
                {cart.length > 0 && (
                  <div
                    style={{
                      padding: "1rem",
                      borderTop: "1px solid rgba(226, 232, 240, 0.8)",
                      background: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                          Total:
                        </span>
                        <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "#059669" }}>
                          ₱{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "white",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 150ms ease"
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If user is cashier, render without sidebar but with header
  if (role === "cashier") {
    return (
      <>
        <Header />
        <div style={{ paddingTop: "80px", height: "100vh", overflow: "hidden" }}>
          {posContent}
        </div>
        {showCheckoutModal && (
          <CheckoutConfirmationModal
            cart={cart}
            total={total}
            onConfirm={processCheckout}
            onCancel={() => setShowCheckoutModal(false)}
            isProcessing={isProcessingCheckout}
          />
        )}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  // If user is owner, render with sidebar and header
  return (
    <>
      <Header />
      <MainLayout onLogout={handleLogout}>
        {posContent}
      </MainLayout>
      {showCheckoutModal && (
        <CheckoutConfirmationModal
          cart={cart}
          total={total}
          onConfirm={processCheckout}
          onCancel={() => setShowCheckoutModal(false)}
          isProcessing={isProcessingCheckout}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default POS;