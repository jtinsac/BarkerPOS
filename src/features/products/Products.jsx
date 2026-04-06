import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Swal from "sweetalert2";
import { createRoot } from "react-dom/client";
import CreateProductForm from "./CreateProductForm.jsx";
import EditProductForm from "./EditProductForm.jsx";
import ViewProductForm from "./ViewProductForm.jsx";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "name", direction: "asc" }); // key: "name" | "price"
  const pageSize = 10;

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // This function handles deleting a product with confirmation
  const handleDeleteProduct = async (product) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      html: `Are you sure you want to delete <strong>${product.name}</strong>?<br><span style="color: #64748b; font-size: 0.9rem;">This action cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      width: "400px",
      customClass: {
        popup: "swal2-barker-popup swal2-delete-confirmation",
        confirmButton: "swal2-confirm-delete",
        cancelButton: "swal2-cancel-delete",
        actions: "swal2-delete-actions"
      },
      buttonsStyling: false,
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        // Delete the product from Firebase
        const productRef = ref(db, `products/${product.id}`);
        await remove(productRef);

        // Show success message
        Swal.fire({
          iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
          title: "Product deleted!",
          text: `${product.name} has been successfully deleted.`,
          timer: 3000,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
          customClass: {
            popup: "swal2-barker-toast",
          },
          showCloseButton: true,
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the product. Please try again.",
          customClass: {
            popup: "swal2-barker-popup",
          },
        });
      }
    }
  };

  // This function handles opening the view modal with product data
  const openViewProductModal = (product) => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-view-product-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-view-product-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <ViewProductForm
            product={product}
            onClose={() => Swal.close()}
          />
        );
      },
      willClose: () => {
        root?.unmount();
        root = null;
      },
    });
  };

  // This function handles opening the edit modal with product data
  const openEditProductModal = (product) => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-edit-product-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-edit-product-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <EditProductForm
            product={product}
            onSuccess={() => {
              Swal.close();
              setTimeout(() => {
                Swal.fire({
                  iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
                  title: "Product updated!",
                  text: "The product has been successfully updated.",
                  timer: 3000,
                  showConfirmButton: false,
                  position: "top-end",
                  toast: true,
                  customClass: {
                    popup: "swal2-barker-toast",
                  },
                  showCloseButton: true,
                });
              }, 150);
            }}
          />
        );
      },
      willClose: () => {
        root?.unmount();
        root = null;
      },
    });
  };

  const openCreateProductModal = () => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-create-product-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-create-product-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <CreateProductForm
            onSuccess={() => {
              Swal.close();
              setTimeout(() => {
                Swal.fire({
                  iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
                  title: "Product added!",
                  text: "The product has been successfully added to your inventory.",
                  timer: 3000,
                  showConfirmButton: false,
                  position: "top-end",
                  toast: true,
                  customClass: {
                    popup: "swal2-barker-toast",
                  },
                  showCloseButton: true,
                });
              }, 150);
            }}
          />
        );
      },
      willClose: () => {
        root?.unmount();
        root = null;
      },
    });
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
      
      if (sort.key === "stockStatus") {
        // Sort by stock status: in-stock first, then out-of-stock
        const av = a?.stockStatus === "in-stock" ? 1 : 0;
        const bv = b?.stockStatus === "in-stock" ? 1 : 0;
        return (bv - av) * dir; // Reverse so in-stock comes first when ascending
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
        
        .swal2-popup.swal2-barker-popup {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%) !important;
          border: 1px solid rgba(226, 232, 240, 0.6) !important;
          border-radius: 20px !important;
          box-shadow: 0 32px 64px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset !important;
          backdrop-filter: blur(12px) !important;
          padding: 0 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-close {
          position: absolute !important;
          top: 16px !important;
          right: 16px !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(226, 232, 240, 0.7) !important;
          background: rgba(255, 255, 255, 0.9) !important;
          color: #64748b !important;
          font-size: 18px !important;
          font-weight: 400 !important;
          transition: all 120ms ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-close:hover {
          background: rgba(248, 250, 252, 0.95) !important;
          border-color: #cbd5e1 !important;
          transform: scale(1.05) !important;
          color: #475569 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-icon.swal2-success {
          border-color: #10b981 !important;
          color: #10b981 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-icon.swal2-success [class^='swal2-success-line'] {
          background-color: #10b981 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-icon.swal2-success .swal2-success-ring {
          border-color: #10b981 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-title {
          color: #0f172a !important;
          font-weight: 800 !important;
        }
        
        .swal2-popup.swal2-barker-popup .swal2-html-container {
          color: #64748b !important;
        }
        
        .swal2-popup.swal2-barker-toast {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%) !important;
          border: 1px solid rgba(226, 232, 240, 0.6) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset !important;
          backdrop-filter: blur(12px) !important;
          padding: 16px !important;
          min-width: 350px !important;
        }
        
        .swal2-popup.swal2-barker-toast .swal2-title {
          color: #0f172a !important;
          font-weight: 700 !important;
          font-size: 1rem !important;
          margin: 0 0 4px 0 !important;
        }
        
        .swal2-popup.swal2-barker-toast .swal2-html-container {
          color: #64748b !important;
          font-size: 0.9rem !important;
          margin: 0 !important;
        }
        
        .swal2-popup.swal2-barker-toast .swal2-icon {
          width: 24px !important;
          height: 24px !important;
          margin: 0 8px 0 0 !important;
          border: none !important;
        }
        
        .swal2-popup.swal2-barker-toast .swal2-close {
          width: 24px !important;
          height: 24px !important;
          border-radius: 8px !important;
          border: 1px solid rgba(226, 232, 240, 0.7) !important;
          background: rgba(255, 255, 255, 0.9) !important;
          color: #64748b !important;
          font-size: 14px !important;
          transition: all 120ms ease !important;
        }
        
        .swal2-popup.swal2-barker-toast .swal2-close:hover {
          background: rgba(248, 250, 252, 0.95) !important;
          border-color: #cbd5e1 !important;
          color: #475569 !important;
        }
        
        .swal2-popup.swal2-delete-confirmation {
          padding: 2rem !important;
        }
        
        .swal2-popup.swal2-delete-confirmation .swal2-actions {
          margin-top: 2rem !important;
          margin-bottom: 0.5rem !important;
          padding: 0 !important;
        }
        
        .swal2-confirm-delete {
          padding: 0.75rem 1.5rem !important;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          cursor: pointer !important;
          transition: all 120ms ease !important;
          margin: 0 0.5rem !important;
        }
        
        .swal2-confirm-delete:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3) !important;
        }
        
        .swal2-cancel-delete {
          padding: 0.75rem 1.5rem !important;
          background: rgba(107, 114, 128, 0.1) !important;
          color: #6b7280 !important;
          border: 1px solid rgba(107, 114, 128, 0.3) !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          cursor: pointer !important;
          transition: all 120ms ease !important;
          margin: 0 0.5rem !important;
        }
        
        .swal2-cancel-delete:hover {
          background: rgba(107, 114, 128, 0.15) !important;
          border-color: #9ca3af !important;
          transform: translateY(-1px) !important;
        }
      `}</style>

      <div className="productsPage" style={{ 
        borderRadius: "18px", 
        padding: "1rem",
        flex: "1",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
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
          <div style={{ position: "relative", minWidth: "300px", flex: "1 1 300px" }}>
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

          <button onClick={openCreateProductModal}
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
          flex: "1",
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}
      >
        <div style={{ 
          width: "100%", 
          overflowX: "auto",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{ 
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: "1"
            }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>
                No products found
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.92rem", color: "#64748b" }}>
                Try a different search term.
              </div>
            </div>
          ) : (
            <div style={{
              flex: "1",
              overflow: "auto",
              minHeight: 0
            }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: "900px",
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
                    style={{
                      textAlign: "left",
                      padding: "0.9rem 1rem",
                      fontSize: "0.8rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#475569",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Category
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
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSort("stockStatus")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") toggleSort("stockStatus");
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
                      Status <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("stockStatus")}</span>
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
                        {product.hasVariants && product.variants && (
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                            {Object.entries(product.variants).map(([size, variant]) => (
                              <span
                                key={size}
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "0.2rem 0.5rem",
                                  borderRadius: "4px",
                                  background: variant.stockStatus === "in-stock" 
                                    ? "rgba(16, 185, 129, 0.1)" 
                                    : "rgba(239, 68, 68, 0.1)",
                                  color: variant.stockStatus === "in-stock" ? "#059669" : "#dc2626",
                                  fontWeight: 600
                                }}
                              >
                                {size}: ₱{variant.price.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.9rem",
                        color: "#64748b",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "6px",
                          background: "rgba(59,130,246,0.08)",
                          color: "#1d4ed8",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {product.category ?? "Uncategorized"}
                      </span>
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
                      {product.hasVariants && product.variants ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                          {Object.entries(product.variants).map(([size, variant]) => (
                            <span key={size} style={{ fontSize: "0.85rem", color: "#64748b" }}>
                              {size}: ₱{variant.price.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>₱{Number(product.price ?? 0).toLocaleString()}</span>
                      )}
                    </td>

                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.95rem",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.35rem 0.7rem",
                          borderRadius: "999px",
                          background: product.stockStatus === "in-stock" 
                            ? "rgba(16,185,129,0.10)" 
                            : "rgba(239,68,68,0.10)",
                          border: product.stockStatus === "in-stock" 
                            ? "1px solid rgba(16,185,129,0.25)" 
                            : "1px solid rgba(239,68,68,0.25)",
                          color: product.stockStatus === "in-stock" ? "#047857" : "#dc2626",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {product.stockStatus === "in-stock" ? "In Stock" : "Out of Stock"}
                      </span>
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
                          onClick={() => openViewProductModal(product)}
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
                          onClick={() => openEditProductModal(product)}
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
                          onClick={() => handleDeleteProduct(product)}
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
            </div>
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
    </MainLayout>
    </>
  );
};

export default Products;