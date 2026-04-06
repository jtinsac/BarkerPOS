import { useState, useEffect } from "react";
import { ref, update, onValue } from "firebase/database";
import { db } from "../../lib/firebase";
import ImageUpload from "../../components/ImageUpload";

const EditProductForm = ({ product, onSuccess }) => {
  // Initialize form state with the existing product data
  const [name, setName] = useState(product.name || "");
  const [basePrice, setBasePrice] = useState(product.hasVariants ? "" : (product.price || ""));
  const [stockStatus, setStockStatus] = useState(product.stockStatus || "in-stock");
  const [category, setCategory] = useState(product.category || "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(product.hasVariants || false);
  const [variants, setVariants] = useState(() => {
    if (product.hasVariants && product.variants) {
      return Object.entries(product.variants).map(([size, variant]) => ({
        size,
        price: variant.price.toString(),
        stock: variant.stockStatus === "in-stock" ? "1" : "0"
      }));
    }
    return [
      { size: "16oz", price: "", stock: "1" },
      { size: "22oz", price: "", stock: "1" }
    ];
  });

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

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: "", price: "", stock: "1" }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    }
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
    
    if (!name || !category) {
      setError("Please fill all required fields");
      return;
    }

    if (hasVariants) {
      // Validate variants
      const validVariants = variants.filter(v => v.size && v.price && v.stock !== "");
      if (validVariants.length === 0) {
        setError("Please add at least one complete variant (size, price, and stock status)");
        return;
      }
    } else {
      // Validate single product
      if (!basePrice) {
        setError("Please enter a price for the product");
        return;
      }
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        name: name,
        category: category,
        imageUrl: imageUrl || null,
        hasVariants: hasVariants
      };

      if (hasVariants) {
        // Product with size variants
        const validVariants = variants.filter(v => v.size && v.price && v.stock !== "");
        productData.variants = {};
        validVariants.forEach(variant => {
          const stockValue = Number(variant.stock);
          productData.variants[variant.size] = {
            price: Number(variant.price),
            stock: stockValue,
            stockStatus: stockValue > 0 ? "in-stock" : "out-of-stock"
          };
        });
        // Set overall stock status based on variants
        productData.stockStatus = Object.values(productData.variants).some(v => v.stockStatus === "in-stock") 
          ? "in-stock" : "out-of-stock";
      } else {
        // Single product without variants
        productData.price = Number(basePrice);
        productData.stockStatus = stockStatus;
      }

      // Update the product in Firebase
      const productRef = ref(db, `products/${product.id}`);
      await update(productRef, productData);

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
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer"
              }}
            />
            This product has size variants (e.g., drinks with different sizes)
          </label>
        </div>

        {!hasVariants ? (
          // Single product pricing
          <>
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
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
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
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </>
        ) : (
          // Variants section
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Size Variants
            </label>
            
            {variants.map((variant, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "end",
                  marginBottom: "0.75rem",
                  padding: "1rem",
                  background: "rgba(248, 250, 252, 0.5)",
                  borderRadius: "10px",
                  border: "1px solid rgba(226, 232, 240, 0.6)"
                }}
              >
                <div style={{ flex: "1" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: "#64748b" }}>Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 16oz, 22oz, Small, Large"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    style={{ ...inputStyle, fontSize: "0.9rem", padding: "0.6rem 0.8rem" }}
                  />
                </div>
                <div style={{ flex: "1" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: "#64748b" }}>Price (₱)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    style={{ ...inputStyle, fontSize: "0.9rem", padding: "0.6rem 0.8rem" }}
                  />
                </div>
                <div style={{ flex: "1" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: "#64748b" }}>Stock Status</label>
                  <select
                    value={variant.stock > 0 ? "in-stock" : "out-of-stock"}
                    onChange={(e) => updateVariant(index, 'stock', e.target.value === "in-stock" ? "1" : "0")}
                    style={{ ...inputStyle, fontSize: "0.9rem", padding: "0.6rem 0.8rem", cursor: "pointer" }}
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    style={{
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addVariant}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                background: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}
            >
              + Add Size Variant
            </button>
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

        <ImageUpload
          onImageUpload={setImageUrl}
          currentImageUrl={product.imageUrl}
          disabled={isSubmitting}
        />

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