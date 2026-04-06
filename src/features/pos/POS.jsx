import { useEffect, useState, useContext } from "react";
import { ref, onValue, push, update, get, serverTimestamp } from "firebase/database";
import { db, auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { UserContext } from "../../context/UserContext.jsx";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";
import { ShoppingCart, X, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Size Selection Modal Component
const SizeSelectionModal = ({ product, onSelectSize, onCancel }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedVariant(product.variants[size]);
  };

  const handleAddToCart = () => {
    if (selectedSize && selectedVariant) {
      onSelectSize({ ...selectedVariant, size: selectedSize });
    }
  };

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
          maxWidth: "400px",
          width: "90%",
          overflow: "hidden",
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(139,69,19,0.16), rgba(160,82,45,0.12))",
            padding: "1.25rem",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em"
            }}
          >
            Select Size
          </h2>
          <p style={{
            margin: "0.5rem 0 0",
            fontSize: "0.9rem",
            color: "#64748b"
          }}>
            {product.name}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151"
            }}>
              Choose Size:
            </label>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.entries(product.variants).map(([size, variant]) => {
                const isOutOfStock = variant.stockStatus !== "in-stock";
                return (
                  <label
                    key={size}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: selectedSize === size 
                        ? "2px solid #8B4513" 
                        : "1px solid rgba(226, 232, 240, 0.8)",
                      background: isOutOfStock 
                        ? "rgba(156, 163, 175, 0.1)" 
                        : selectedSize === size 
                          ? "rgba(139, 69, 19, 0.1)" 
                          : "rgba(255,255,255,0.8)",
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      transition: "all 150ms ease",
                      opacity: isOutOfStock ? 0.6 : 1
                    }}
                    onClick={() => !isOutOfStock && handleSizeChange(size)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={selectedSize === size}
                        onChange={() => handleSizeChange(size)}
                        disabled={isOutOfStock}
                        style={{ margin: 0 }}
                      />
                      <div>
                        <div style={{ 
                          fontWeight: "600", 
                          fontSize: "0.95rem",
                          color: isOutOfStock ? "#9ca3af" : "#0f172a"
                        }}>
                          {size}
                        </div>
                        <div style={{ 
                          fontSize: "0.8rem", 
                          color: isOutOfStock ? "#9ca3af" : "#64748b" 
                        }}>
                          {isOutOfStock ? "Out of stock" : "Available"}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      fontWeight: "700", 
                      fontSize: "1rem",
                      color: isOutOfStock ? "#9ca3af" : "#8B4513"
                    }}>
                      ₱{variant.price.toLocaleString()}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center"
          }}>
            <button
              onClick={onCancel}
              style={{
                flex: "1",
                padding: "0.75rem",
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                background: "rgba(248, 250, 252, 0.8)",
                color: "#64748b",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 150ms ease"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedVariant || selectedVariant.stockStatus !== "in-stock"}
              style={{
                flex: "1",
                padding: "0.75rem",
                borderRadius: "12px",
                border: "none",
                background: (!selectedSize || !selectedVariant || selectedVariant.stockStatus !== "in-stock")
                  ? "rgba(156, 163, 175, 0.2)"
                  : "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
                color: (!selectedSize || !selectedVariant || selectedVariant.stockStatus !== "in-stock") 
                  ? "#9ca3af" : "white",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: (!selectedSize || !selectedVariant || selectedVariant.stockStatus !== "in-stock") 
                  ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
                boxShadow: (!selectedSize || !selectedVariant || selectedVariant.stockStatus !== "in-stock")
                  ? "none"
                  : "0 4px 12px rgba(139, 69, 19, 0.3)"
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const CheckoutConfirmationModal = ({ cart, total, onConfirm, onCancel, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Calculate cup usage for this transaction
  const calculateCupUsage = () => {
    const cupUsage = { "8oz": 0, "16oz": 0, "22oz": 0 };
    
    cart.forEach(item => {
      const productName = item.name?.toLowerCase() || "";
      const productSize = item.size?.toLowerCase() || "";
      
      let cupSize = null;
      if (productSize.includes("8oz") || productName.includes("8oz") || productSize.includes("8 oz") || productName.includes("8 oz")) {
        cupSize = "8oz";
      } else if (productSize.includes("16oz") || productName.includes("16oz") || productSize.includes("16 oz") || productName.includes("16 oz")) {
        cupSize = "16oz";
      } else if (productSize.includes("22oz") || productName.includes("22oz") || productSize.includes("22 oz") || productName.includes("22 oz")) {
        cupSize = "22oz";
      }
      
      if (cupSize) {
        cupUsage[cupSize] += item.quantity;
      }
    });
    
    return cupUsage;
  };

  const cupUsage = calculateCupUsage();
  const totalCupsUsed = Object.values(cupUsage).reduce((total, count) => total + count, 0);

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
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(139,69,19,0.16), rgba(160,82,45,0.12))",
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
        <div style={{ 
          padding: "1.5rem", 
          flex: "1",
          overflow: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Payment Method Selection */}
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
              Payment Method:
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: paymentMethod === "cash" ? "2px solid #8B4513" : "1px solid rgba(226, 232, 240, 0.8)",
                  background: paymentMethod === "cash" ? "rgba(139, 69, 19, 0.1)" : "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  flex: "1"
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>💵 Cash</span>
              </label>
              
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: paymentMethod === "gcash" ? "2px solid #8B4513" : "1px solid rgba(226, 232, 240, 0.8)",
                  background: paymentMethod === "gcash" ? "rgba(139, 69, 19, 0.1)" : "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  flex: "1"
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="gcash"
                  checked={paymentMethod === "gcash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>📱 GCash</span>
              </label>
            </div>
          </div>

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
            
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
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
                  <span style={{ fontWeight: 600, color: "#8B4513" }}>
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
                  color: "#8B4513",
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
              margin: "1rem 0"
            }}
          >
            Are you sure you want to process this transaction?
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(226, 232, 240, 0.6)",
              flexShrink: 0
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
              Back
            </button>
            <button
              onClick={() => onConfirm(paymentMethod)}
              disabled={isProcessing}
              style={{
                background: isProcessing 
                  ? "rgba(156, 163, 175, 0.2)" 
                  : "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
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
                  : "0 4px 12px rgba(139, 69, 19, 0.3)",
                opacity: isProcessing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(139, 69, 19, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(139, 69, 19, 0.3)";
                }
              }}
            >
              {isProcessing ? "Processing..." : "Place Order"}
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
          ? "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)"
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
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cups, setCups] = useState({ "8oz": 0, "16oz": 0, "22oz": 0 });
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

const processCheckout = async (paymentMethod) => {
  setIsProcessingCheckout(true);
  setShowCheckoutModal(false);
  
  try {
    const currentUser = auth.currentUser;
    console.log("Current user:", currentUser);
    console.log("Cart items:", cart);
    console.log("Total:", total);
    console.log("Payment method:", paymentMethod);
    console.log("User data:", userData);

    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const transactionRef = ref(db, "transactions");
    console.log("Transaction ref created:", transactionRef);

    // Calculate cup usage from cart items
    const cupUsage = { "8oz": 0, "16oz": 0, "22oz": 0 };
    
    cart.forEach(item => {
      // For variant products, size is stored in item.size
      // For legacy products, size might be in the name
      const productName = item.name?.toLowerCase() || "";
      const productSize = item.size?.toLowerCase() || "";
      
      console.log(`Checking product: ${item.name}, productName: ${productName}, productSize: ${productSize}`);
      
      // Determine cup size - prioritize item.size for variant products
      let cupSize = null;
      
      // First check the dedicated size field (for variant products)
      if (productSize) {
        if (productSize.includes("8oz") || productSize.includes("8 oz")) {
          cupSize = "8oz";
        } else if (productSize.includes("16oz") || productSize.includes("16 oz")) {
          cupSize = "16oz";
        } else if (productSize.includes("22oz") || productSize.includes("22 oz")) {
          cupSize = "22oz";
        }
      }
      
      // Fallback to checking product name (for legacy products)
      if (!cupSize) {
        if (productName.includes("8oz") || productName.includes("8 oz")) {
          cupSize = "8oz";
        } else if (productName.includes("16oz") || productName.includes("16 oz")) {
          cupSize = "16oz";
        } else if (productName.includes("22oz") || productName.includes("22 oz")) {
          cupSize = "22oz";
        }
      }
      
      console.log(`Detected cup size: ${cupSize} for product: ${item.name}`);
      
      // If it's a drink (has a cup size), add to cup usage
      if (cupSize) {
        cupUsage[cupSize] += item.quantity;
        console.log(`Added ${item.quantity} cups of size ${cupSize}. New total: ${cupUsage[cupSize]}`);
      }
    });

    console.log("Cup usage:", cupUsage);

    // Create transaction object
    const newTransaction = {
      createdAt: serverTimestamp(),
      userId: currentUser.uid,
      userName: userData?.name || "Unknown User",
      total,
      paymentMethod,
      cupUsage, // Add cup usage to transaction
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null // Include size info if available
      }))
    };

    console.log("New transaction object:", newTransaction);

    const result = await push(transactionRef, newTransaction);
    console.log("Transaction saved with key:", result.key);

    const updates = {};

    // Update product stock
    for (let item of cart) {
      const productRef = ref(db, `products/${item.id}`);
      const snapshot = await get(productRef);

      if (snapshot.exists()) {
        const currentStock = snapshot.val().stock || 0;
        const newStock = currentStock - item.quantity;

        updates[`products/${item.id}/stock`] = newStock < 0 ? 0 : newStock;
      }
    }

    // Update cup counts
    Object.keys(cupUsage).forEach(cupSize => {
      if (cupUsage[cupSize] > 0) {
        updates[`cups/${cupSize}`] = (cups[cupSize] || 0) + cupUsage[cupSize];
      }
    });

    console.log("Stock and cup updates:", updates);

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log("Stock and cups updated successfully");
    }

    clearCart();

    // Create success message with cup usage info
    let cupMessage = "";
    const usedCups = Object.entries(cupUsage).filter(([size, count]) => count > 0);
    if (usedCups.length > 0) {
      cupMessage = ` | Cups used: ${usedCups.map(([size, count]) => `${count}x ${size}`).join(", ")}`;
    }

    setToast({ 
      message: `Transaction completed successfully via ${paymentMethod === 'cash' ? 'Cash' : 'GCash'}!${cupMessage}`, 
      type: "success" 
    });
    console.log("Checkout completed successfully");
  
  } catch(error) {
    console.error("Checkout error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    setToast({ message: `Checkout failed: ${error.message}`, type: "error" });
  } finally {
    setIsProcessingCheckout(false);
  }
};

  useEffect(() => {
    const productsRef = ref(db, "products");
    const cupsRef = ref(db, "cups");

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
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

    const unsubscribeCups = onValue(cupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCups(data);
      } else {
        // Initialize cups data if it doesn't exist
        const initialCups = { "8oz": 0, "16oz": 0, "22oz": 0 };
        update(ref(db), { cups: initialCups });
        setCups(initialCups);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCups();
    };
  }, []);

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products based on search and category (show all products, including out-of-stock)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product) => {
    console.log("Product clicked:", product);
    console.log("Has variants:", product.hasVariants);
    console.log("Variants:", product.variants);
    console.log("Variants keys length:", product.variants ? Object.keys(product.variants).length : 0);
    
    // Check if product has variants and they exist
    if (product.hasVariants && product.variants && Object.keys(product.variants).length > 0) {
      console.log("Showing size selection modal");
      // Show size selection modal for products with variants
      setSelectedProduct(product);
      setShowSizeModal(true);
    } else {
      console.log("Adding directly to cart");
      // Add directly to cart for single products
      addToCart(product);
    }
  };

  const handleSizeSelection = (selectedVariant) => {
    if (selectedProduct && selectedVariant) {
      addToCart(selectedProduct, selectedVariant);
    }
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const addToCart = (product, selectedVariant = null) => {
    // Don't add out-of-stock products to cart
    if (product.stockStatus !== "in-stock") {
      return;
    }
    
    let cartItem;
    if (product.hasVariants && selectedVariant) {
      // Product with variants - use selected variant
      if (selectedVariant.stockStatus !== "in-stock") {
        return; // Don't add out-of-stock variants
      }
      cartItem = {
        id: `${product.id}_${selectedVariant.size}`,
        productId: product.id,
        name: `${product.name} (${selectedVariant.size})`,
        price: selectedVariant.price,
        size: selectedVariant.size,
        category: product.category,
        imageUrl: product.imageUrl
      };
    } else if (!product.hasVariants) {
      // Single product without variants
      cartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl
      };
    } else {
      // Product has variants but no variant selected - shouldn't happen
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...cartItem, quantity: 1 }];
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
            radial-gradient(900px 500px at 10% 0%, rgba(139,69,19,0.18), transparent 60%),
            radial-gradient(900px 500px at 90% 10%, rgba(160,82,45,0.14), transparent 55%),
            radial-gradient(900px 500px at 50% 100%, rgba(210,105,30,0.10), transparent 55%);
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
                border: "1px solid rgba(139,69,19,0.35)",
                background: "rgba(139,69,19,0.10)",
                color: "#8B4513",
                fontWeight: 900,
              }}
            >
              {filteredProducts.length} Products
            </div>
            

            <button
              onClick={() => setShowCart(!showCart)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                background: "rgba(255, 255, 255, 0.95)",
                color: cart.length > 0 ? "#047857" : "#6b7280",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 150ms ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.12)";
                e.target.style.background = "rgba(255, 255, 255, 1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.08)";
                e.target.style.background = "rgba(255, 255, 255, 0.95)";
              }}
            >
              <ShoppingCart size={16} />
              Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
              {cart.length > 0 && (
                <span style={{
                  fontSize: "0.7rem",
                  background: "rgba(16,185,129,0.2)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "8px",
                  marginLeft: "0.25rem"
                }}>
                  ₱{total.toLocaleString()}
                </span>
              )}
            </button>
            {role === "cashier" && (
              <button
                onClick={() => navigate('/cashier-sales')}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#6b7280",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
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
                <Receipt size={16} />
                Today's Sales
              </button>
            )}
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
              gridTemplateColumns: showCart ? "1fr 400px" : "1fr",
              gap: "1.5rem",
              flex: "1",
              overflow: "hidden",
              minHeight: 0,
              transition: "grid-template-columns 300ms ease"
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

              {/* Products by Category */}
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
                      overflow: "auto",
                      flex: "1",
                      paddingRight: "0.5rem"
                    }}
                  >
                    {(() => {
                      // Group products by category
                      const productsByCategory = filteredProducts.reduce((acc, product) => {
                        const category = product.category || 'Uncategorized';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(product);
                        return acc;
                      }, {});

                      return Object.entries(productsByCategory).map(([category, products]) => (
                        <div key={category} style={{ marginBottom: "2rem" }}>
                          {/* Category Header */}
                          <div style={{
                            fontSize: "1.1rem",
                            fontWeight: "800",
                            color: "#0f172a",
                            marginBottom: "1rem",
                            padding: "0.75rem 1rem",
                            background: "linear-gradient(90deg, rgba(139,69,19,0.12), rgba(160,82,45,0.08))",
                            border: "1px solid rgba(226, 232, 240, 0.6)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}>
                            <span>{category}</span>
                            <span style={{
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              color: "#64748b",
                              background: "rgba(255,255,255,0.7)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px"
                            }}>({products.length})</span>
                          </div>
                          
                          {/* Products Grid for this category */}
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "1rem",
                            marginBottom: "1rem"
                          }}>
                            {products.map((product) => {
                              const isOutOfStock = product.stockStatus !== "in-stock";
                              
                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!isOutOfStock) {
                                      handleProductClick(product);
                                    }
                                  }}
                                  disabled={isOutOfStock}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "0",
                                    borderRadius: "12px",
                                    border: isOutOfStock 
                                      ? "1px solid rgba(156, 163, 175, 0.5)" 
                                      : "1px solid rgba(226, 232, 240, 0.8)",
                                    background: isOutOfStock 
                                      ? "rgba(156, 163, 175, 0.1)" 
                                      : "rgba(248, 250, 252, 0.6)",
                                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                                    transition: "all 150ms ease",
                                    textAlign: "left",
                                    height: "280px",
                                    justifyContent: "flex-start",
                                    overflow: "hidden",
                                    opacity: isOutOfStock ? 0.6 : 1,
                                    filter: isOutOfStock ? "grayscale(50%)" : "none"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isOutOfStock) {
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(15, 23, 42, 0.15)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isOutOfStock) {
                                      e.currentTarget.style.transform = "translateY(0)";
                                      e.currentTarget.style.boxShadow = "none";
                                    }
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
                                          color: "#0f172a",
                                          marginBottom: "0.25rem",
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
                                        <div
                                          style={{
                                            fontSize: "0.75rem",
                                            color: isOutOfStock ? "#dc2626" : "#047857",
                                            background: isOutOfStock 
                                              ? "rgba(239, 68, 68, 0.1)" 
                                              : "rgba(16, 185, 129, 0.1)",
                                            border: isOutOfStock 
                                              ? "1px solid rgba(239, 68, 68, 0.2)" 
                                              : "1px solid rgba(16, 185, 129, 0.2)",
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "6px",
                                            display: "inline-block",
                                            fontWeight: "600",
                                            flexShrink: 0
                                          }}
                                        >
                                          {isOutOfStock ? "Out of Stock" : "In Stock"}
                                        </div>
                                        {product.hasVariants && (
                                          <div
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "#8B4513",
                                              background: "rgba(139, 69, 19, 0.1)",
                                              border: "1px solid rgba(139, 69, 19, 0.2)",
                                              padding: "0.2rem 0.5rem",
                                              borderRadius: "6px",
                                              display: "inline-block",
                                              fontWeight: "600",
                                              flexShrink: 0
                                            }}
                                          >
                                            Multiple Sizes
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Price */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                                      {product.hasVariants && product.variants ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                          <span style={{
                                            fontSize: "0.7rem",
                                            color: "#64748b",
                                            marginBottom: "0.1rem"
                                          }}>
                                            Starting at:
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "0.95rem",
                                              fontWeight: "800",
                                              color: isOutOfStock ? "#9ca3af" : "#8B4513"
                                            }}
                                          >
                                            ₱{Math.min(...Object.values(product.variants).map(v => v.price)).toLocaleString()}
                                          </span>
                                        </div>
                                      ) : (
                                        <span
                                          style={{
                                            fontSize: "0.95rem",
                                            fontWeight: "800",
                                            color: isOutOfStock ? "#9ca3af" : "#8B4513"
                                          }}
                                        >
                                          ₱{Number(product.price || 0).toLocaleString()}
                                        </span>
                                      )}
                                      {isOutOfStock && (
                                        <span style={{
                                          fontSize: "0.65rem",
                                          fontWeight: "600",
                                          color: "#dc2626",
                                          background: "rgba(239, 68, 68, 0.1)",
                                          padding: "0.15rem 0.3rem",
                                          borderRadius: "3px",
                                          border: "1px solid rgba(239, 68, 68, 0.2)"
                                        }}>
                                          UNAVAILABLE
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - Cart (Conditional) */}
            {showCart && (
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
                    background: "linear-gradient(90deg, rgba(139,69,19,0.16), rgba(160,82,45,0.12))",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                      Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
                    </h2>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                        <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "#8B4513" }}>
                          ₱{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => setShowCart(false)}
                        style={{
                          flex: "0.7",
                          padding: "0.65rem",
                          borderRadius: "12px",
                          border: "none",
                          background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
                          color: "white",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "linear-gradient(135deg, #A0522D 0%, #8B4513 100%)";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 6px 16px rgba(139, 69, 19, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 12px rgba(139, 69, 19, 0.3)";
                        }}
                      >
                        Continue<br />Shopping
                      </button>
                      <button
                        onClick={handleCheckout}
                        style={{
                          flex: "1.3",
                          padding: "0.65rem",
                          borderRadius: "12px",
                          border: "none",
                          background: "linear-gradient(135deg, #D2691E 0%, #CD853F 100%)",
                          color: "white",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 150ms ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 6px 16px rgba(210, 105, 30, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 12px rgba(210, 105, 30, 0.3)";
                        }}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
        {showSizeModal && selectedProduct && (
          <SizeSelectionModal
            product={selectedProduct}
            onSelectSize={handleSizeSelection}
            onCancel={() => {
              setShowSizeModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
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
      {showSizeModal && selectedProduct && (
        <SizeSelectionModal
          product={selectedProduct}
          onSelectSize={handleSizeSelection}
          onCancel={() => {
            setShowSizeModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
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