import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "name", direction: "asc" }); // key: "name" | "price"

  const pageSize = 10;

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
      console.log("Products:", productsArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const normalizedQuery = String(searchQuery || "").trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((p) => {
        const id = String(p?.id ?? "").toLowerCase();
        const name = String(p?.name ?? "").toLowerCase();
        return id.includes(normalizedQuery) || name.includes(normalizedQuery);
      })
    : products;

  const sortedProducts = (() => {
    const dir = sort.direction === "desc" ? -1 : 1;
    const list = [...filteredProducts];

    list.sort((a, b) => {
      if (sort.key === "price") {
        const av = Number(a?.price ?? 0);
        const bv = Number(b?.price ?? 0);
        return (av - bv) * dir;
      }

      const av = String(a?.name ?? "").toLowerCase();
      const bv = String(b?.name ?? "").toLowerCase();
      return av.localeCompare(bv) * dir;
    });

    return list;
  })();

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedProducts.length);
  const pageItems = sortedProducts.slice(startIndex, startIndex + pageSize);

  const pageNumbers = (() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const left = Math.max(1, safePage - 2);
    const right = Math.min(totalPages, safePage + 2);
    const pages = new Set([1, totalPages]);
    for (let i = left; i <= right; i++) pages.add(i);

    return Array.from(pages).sort((a, b) => a - b);
  })();

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
    setPage(1);
  };

  const sortLabel = (key) => {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100%",
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      }}
    >
      <style>{`
        .productsPage {
          background:
            radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%),
            radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%);
        }
        .productsCard { backdrop-filter: blur(6px); }
        .productsTableRow td { transition: background 140ms ease; }
        .productsTableRow:hover td { background: rgba(59, 130, 246, 0.06); }
        .productsBtn { transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease; }
        .productsBtn:hover { background: rgba(248, 250, 252, 0.9); border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.10); }
        .productsBtn:active { transform: translateY(0px); box-shadow: 0 4px 10px rgba(15, 23, 42, 0.10); }
        .productsBtn:disabled { opacity: 0.5; cursor: not-allowed; }
        .productsInput:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      `}</style>

      <div className="productsPage" style={{ borderRadius: "18px", padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: "220px" }}>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Products
          </div>
          <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
            Manage products (10 per page)
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
            <input
              className="productsInput"
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name…"
              style={{
                width: "100%",
                padding: "0.65rem 0.8rem",
                borderRadius: "10px",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                fontSize: "0.95rem",
                color: "#0f172a",
              }}
            />
          </div>

          <button
            type="button"
            className="productsBtn"
            style={{
              padding: "0.65rem 0.9rem",
              borderRadius: "10px",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#0f172a",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + New Product
          </button>
        </div>
      </div>

      <div
        className="productsCard"
        style={{
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(226, 232, 240, 0.85)",
          borderRadius: "14px",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.5) inset",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", overflowX: "auto" }}>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>
                No products found
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.92rem", color: "#64748b" }}>
                Try a different search term.
              </div>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: "720px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
                  }}
                >
                  <th
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSort("name")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") toggleSort("name");
                    }}
                    style={{
                      textAlign: "left",
                      padding: "0.9rem 1rem",
                      fontSize: "0.8rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#475569",
                      borderBottom: "1px solid #e2e8f0",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      Name <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("name")}</span>
                    </span>
                  </th>
                  <th
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSort("price")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") toggleSort("price");
                    }}
                    style={{
                      textAlign: "right",
                      padding: "0.9rem 1rem",
                      fontSize: "0.8rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#475569",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      Price <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("price")}</span>
                    </span>
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "0.9rem 1rem",
                      fontSize: "0.8rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#475569",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((product) => (
                  <tr key={product.id} className="productsTableRow">
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        <span>{product.name ?? "—"}</span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          In stock: {product.stock ?? "—"}
                        </span>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.95rem",
                        color: "#0f172a",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      ₱{Number(product.price ?? 0).toLocaleString()}
                    </td>

                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div style={{ display: "inline-flex", gap: "0.45rem" }}>
                        <button
                          type="button"
                          className="productsBtn"
                          style={{
                            padding: "0.45rem 0.7rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(59,130,246,0.35)",
                            background: "rgba(59,130,246,0.10)",
                            color: "#1d4ed8",
                            fontWeight: 800,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="productsBtn"
                          style={{
                            padding: "0.45rem 0.7rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(16,185,129,0.35)",
                            background: "rgba(16,185,129,0.10)",
                            color: "#047857",
                            fontWeight: 800,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="productsBtn"
                          style={{
                            padding: "0.45rem 0.7rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(239,68,68,0.35)",
                            background: "rgba(239,68,68,0.10)",
                            color: "#b91c1c",
                            fontWeight: 800,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.9rem 1rem",
            borderTop: "1px solid #e2e8f0",
            background: "#ffffff",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "0.92rem", color: "#64748b" }}>
            Showing{" "}
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {filteredProducts.length === 0 ? 0 : startIndex + 1}–{endIndex}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {filteredProducts.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="productsBtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              style={{
                padding: "0.55rem 0.8rem",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              Previous
            </button>

            {pageNumbers.map((n, idx) => {
              const prev = pageNumbers[idx - 1];
              const showDots = prev && n - prev > 1;

              return (
                <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  {showDots ? (
                    <span style={{ padding: "0 0.1rem", color: "#94a3b8", userSelect: "none" }}>…</span>
                  ) : null}
                  <button
                    type="button"
                    className="productsBtn"
                    aria-current={n === safePage ? "page" : undefined}
                    onClick={() => setPage(n)}
                    style={{
                      padding: "0.55rem 0.75rem",
                      borderRadius: "10px",
                      border: n === safePage ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                      background: n === safePage ? "rgba(59,130,246,0.08)" : "#ffffff",
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: n === safePage ? "#1d4ed8" : "#0f172a",
                      cursor: "pointer",
                      minWidth: "40px",
                    }}
                  >
                    {n}
                  </button>
                </span>
              );
            })}

            <button
              type="button"
              className="productsBtn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              style={{
                padding: "0.55rem 0.8rem",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Products;