import { useEffect, useMemo, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { disableUser } from "../../services/userService";
import Swal from "sweetalert2";
import { createRoot } from "react-dom/client";
import CreateUserForm from "./CreateUserForm.jsx";
import EditUserForm from "./EditUserForm.jsx";
import ViewUserForm from "./ViewUserForm.jsx";
import MainLayout from "../../components/layout/MainLayout.jsx";
import Header from "../../components/layout/Header.jsx";

const User = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "email", direction: "asc" });
  const pageSize = 10;

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // This function handles deleting a user with confirmation
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Delete User?",
      html: `Are you sure you want to delete <strong>${user.email}</strong>?<br><span style="color: #64748b; font-size: 0.9rem;">This action cannot be undone.</span>`,
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
        // Disable user instead of deleting (since we can't delete other users client-side)
        await disableUser(user.uid, user);

        // Show success message
        Swal.fire({
          iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
          title: "User deleted!",
          text: `${user.email} has been successfully deleted.`,
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
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the user. Please try again.",
          customClass: {
            popup: "swal2-barker-popup",
          },
        });
      }
    }
  };

  // This function handles opening the view modal with user data
  const openViewUserModal = (user) => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-view-user-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-view-user-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <ViewUserForm
            user={user}
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

  // This function handles opening the edit modal with user data
  const openEditUserModal = (user) => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-edit-user-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-edit-user-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <EditUserForm
            user={user}
            onSuccess={() => {
              Swal.close();
              setTimeout(() => {
                Swal.fire({
                  iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
                  title: "User updated!",
                  text: "The user has been successfully updated.",
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

  const openCreateUserModal = () => {
    let root = null;

    Swal.fire({
      html: `<div id="swal-create-user-root"></div>`,
      customClass: {
        popup: "swal2-barker-popup",
      },
      showConfirmButton: false,
      showCloseButton: true,
      width: "480px",
      padding: "0",
      backdrop: "rgba(15, 23, 42, 0.4)",
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector("#swal-create-user-root");
        if (!container) return;
        root = createRoot(container);
        root.render(
          <CreateUserForm
            onSuccess={() => {
              Swal.close();
              setTimeout(() => {
                Swal.fire({
                  iconHtml: '<div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">✓</div>',
                  title: "User added!",
                  text: "The new user has been successfully created and added to your team.",
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
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setUsers([]);
        return;
      }

      // Internal UID is needed as a React key, but we do not display it in the table.
      const usersArray = Object.entries(data).map(([uid, value]) => ({
        uid,
        ...value,
      }));

      setUsers(usersArray);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = String(searchQuery || "")
      .trim()
      .toLowerCase();

    if (!normalizedQuery) return users;

    return users.filter((u) => {
      const email = String(u?.email ?? "").toLowerCase();
      const role = String(u?.role ?? "").toLowerCase();
      const name = String(u?.name ?? "").toLowerCase();
      return email.includes(normalizedQuery) || role.includes(normalizedQuery) || name.includes(normalizedQuery);
    });
  }, [searchQuery, users]);

  const sortedUsers = useMemo(() => {
    const dir = sort.direction === "desc" ? -1 : 1;
    const list = [...filteredUsers];

    list.sort((a, b) => {
      if (sort.key === "createdAt") {
        const av = Number(a?.createdAt ?? 0);
        const bv = Number(b?.createdAt ?? 0);
        return (av - bv) * dir;
      }

      const av = String(a?.[sort.key] ?? "").toLowerCase();
      const bv = String(b?.[sort.key] ?? "").toLowerCase();
      return av.localeCompare(bv) * dir;
    });

    return list;
  }, [filteredUsers, sort.direction, sort.key]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedUsers.length);
  const pageItems = sortedUsers.slice(startIndex, startIndex + pageSize);

  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const left = Math.max(1, safePage - 2);
    const right = Math.min(totalPages, safePage + 2);
    const pages = new Set([1, totalPages]);

    for (let i = left; i <= right; i++) pages.add(i);

    return Array.from(pages).sort((a, b) => a - b);
  }, [safePage, totalPages]);

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
        .usersPage {
          background:
            radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%),
            radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%);
        }
        .usersCard { backdrop-filter: blur(6px); }
        .usersTableRow td { transition: background 140ms ease; }
        .usersTableRow:hover td { background: rgba(59, 130, 246, 0.06); }
        .usersBtn { transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease; }
        .usersBtn:hover { background: rgba(248, 250, 252, 0.9); border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.10); }
        .usersBtn:active { transform: translateY(0px); box-shadow: 0 4px 10px rgba(15, 23, 42, 0.10); }
        .usersBtn:disabled { opacity: 0.5; cursor: not-allowed; }
        .usersInput:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        
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

      <div className="usersPage" style={{ 
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
              Users
            </div>
            <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#64748b" }}>
              Manage users (10 per page)
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "300px", flex: "1 1 300px" }}>
              <input
                className="usersInput"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email or role…"
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
              onClick={openCreateUserModal}
              type="button"
              className="usersBtn"
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
              + New User
            </button>
          </div>
        </div>

        <div
          className="usersCard"
          style={{
            background: "rgba(255,255,255,0.86)",
            border: "1px solid rgba(226, 232, 240, 0.85)",
            borderRadius: "14px",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.5) inset",
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
            {filteredUsers.length === 0 ? (
              <div style={{ 
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flex: "1"
              }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>
                  No users found
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
                      background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
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
                      onClick={() => toggleSort("email")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleSort("email");
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
                        Email <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("email")}</span>
                      </span>
                    </th>

                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("role")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleSort("role");
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        Role <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("role")}</span>
                      </span>
                    </th>

                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("createdAt")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleSort("createdAt");
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
                        Created{" "}
                        <span style={{ color: "#64748b", fontWeight: 900 }}>{sortLabel("createdAt")}</span>
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
                  {pageItems.map((user) => (
                    <tr key={user.uid} className="usersTableRow">
                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {user.name ?? "—"}
                      </td>

                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {user.email ?? "—"}
                      </td>

                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.95rem",
                          color: "#0f172a",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.35rem 0.6rem",
                            borderRadius: "999px",
                            background:
                              user.role === "owner"
                                ? "rgba(59,130,246,0.10)"
                                : "rgba(16,185,129,0.10)",
                            border:
                              user.role === "owner"
                                ? "1px solid rgba(59,130,246,0.25)"
                                : "1px solid rgba(16,185,129,0.25)",
                            color: user.role === "owner" ? "#1d4ed8" : "#047857",
                            fontWeight: 900,
                            fontSize: "0.82rem",
                          }}
                        >
                          {user.role ?? "—"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          borderBottom: "1px solid #f1f5f9",
                          color: "#0f172a",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
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
                            className="usersBtn"
                            onClick={() => openViewUserModal(user)}
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
                            className="usersBtn"
                            onClick={() => openEditUserModal(user)}
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
                            className="usersBtn"
                            onClick={() => handleDeleteUser(user)}
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
                {filteredUsers.length === 0 ? 0 : startIndex + 1}–{endIndex}
              </span>{" "}
              of{" "}
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{filteredUsers.length}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="usersBtn"
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
                      className="usersBtn"
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
                className="usersBtn"
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

export default User;

