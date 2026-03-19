import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";

const POS = () => {
  const [products, setProducts] = useState([]);

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
      console.log("POS products:", productsArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr",
        gap: "1.5rem",
        padding: "1.5rem",
      }}
    >
      {/* LEFT SIDE - Products */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Products
        </h2>

        {products.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            No products found. Add products in Firebase to see them here.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#eef2ff";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginBottom: "0.35rem",
                    color: "#111827",
                  }}
                >
                  {product.name}
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#2563eb",
                  }}
                >
                  ₱{Number(product.price).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE - Cart Placeholder */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Cart
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          Cart functionality coming soon. Products will appear here when added.
        </p>
      </div>
    </div>
  );
};

export default POS;

