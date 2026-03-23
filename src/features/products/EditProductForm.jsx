import { useState, useEffect } from "react";
import { ref, update, onValue } from "firebase/database";
import { db } from "../../lib/firebase";

const EditProductForm = ({ product, onSuccess }) => {
  // Initialize form state with the existing product data
  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price || "");
  const [stock, setStock] = useState(product.stock || "");
  const [category, setCategory] = useState(product.category || "");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    background: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.95rem",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 120ms ease",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  };

  const inputFocusStyle = {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.12), 0 4px 12px rgba(15, 23, 42, 0.08)",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(59,130,246,0.25)",
    background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#1d4ed8",
    cursor: "pointer",
    transition: "all 120ms ease",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
  };

  useEffect(() => {
    const productsRef = ref(db, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Extract unique categories from existing products
        const categorySet = new Set();
        Object.values(data).forEach(product => {
          if (product.category) {
            categorySet.add(product.category);
          }
        });
        const categoriesArray = Array.from(categorySet).sort().map(name => ({ name }));
        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (!name || !price || !stock || !category) {
      setError("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Update the product in Firebase
      const productRef = ref(db, `products/${product.id}`);
      await update(productRef, {
        name: name,
        price: Number(price),
        stock: Number(stock),
        category: category,
      });

      setSuccess("Product updated successfully!");
      
      // Close the modal after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError("Failed to update product");
      console.error("Error updating product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)",
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#0f172a",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          Edit Product
        </h2>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.9rem",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Update the details below
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.5rem",
        }}
      >
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#dc2626",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#059669",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Price (₱)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Stock Quantity
          </label>
          <input
            type="number"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          >
            <option value="">Select category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...buttonStyle,
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            background: isSubmitting 
              ? "rgba(156, 163, 175, 0.2)" 
              : "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)",
            color: isSubmitting ? "#9ca3af" : "#1d4ed8"
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 12px 28px rgba(15, 23, 42, 0.12)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.08)";
            }
          }}
        >
          {isSubmitting ? "Updating Product..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProductForm;