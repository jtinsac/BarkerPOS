import React from "react";

const ViewProductForm = ({ product, onClose }) => {
  const displayStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    background: "rgba(248, 250, 252, 0.5)",
    fontSize: "0.95rem",
    color: "#0f172a",
    boxSizing: "border-box",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
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
          Product Details
        </h2>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.9rem",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          View product information
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.5rem",
        }}
      >
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
          <div style={displayStyle}>
            {product.name || "—"}
          </div>
        </div>

        {product.imageUrl && (
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
              Product Image
            </label>
            <div style={{
              ...displayStyle,
              padding: "0.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span style="color: #9ca3af; font-style: italic;">Image not available</span>';
                }}
              />
            </div>
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
            Price (₱)
          </label>
          <div style={displayStyle}>
            {product.price ? `₱${Number(product.price).toLocaleString()}` : "—"}
          </div>
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
          <div style={{
            ...displayStyle,
            color: product.stockStatus === "in-stock" ? "#047857" : "#dc2626",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                background: product.stockStatus === "in-stock" 
                  ? "rgba(16,185,129,0.10)" 
                  : "rgba(239,68,68,0.10)",
                border: product.stockStatus === "in-stock" 
                  ? "1px solid rgba(16,185,129,0.25)" 
                  : "1px solid rgba(239,68,68,0.25)",
                fontSize: "0.85rem",
              }}
            >
              {product.stockStatus === "in-stock" ? "In Stock" : "Out of Stock"}
            </span>
          </div>
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
          <div style={displayStyle}>
            {product.category || "—"}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 12px 28px rgba(15, 23, 42, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.08)";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewProductForm;