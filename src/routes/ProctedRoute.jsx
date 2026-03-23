import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ProtectRoute({children, allowedRoles}){
    const {user, role, loading} = useContext(UserContext);
    
    if(loading){
        return <p>Loading...</p>
    }

    if(!user){
        return <Navigate to="/login"/>
    }

    // If no specific roles are required, allow access to any authenticated user
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    // If specific roles are required but user has no role, deny access
    if (!role) {
        return (
            <div style={{ 
                padding: "2rem", 
                textAlign: "center", 
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                margin: "2rem"
            }}>
                <h3>Access Denied</h3>
                <p>No role assigned to your account. Please contact an administrator.</p>
                <button 
                    onClick={() => window.location.href = '/login'}
                    style={{
                        padding: "0.5rem 1rem",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "1rem"
                    }}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    // If user has a role, check if it's in the allowed roles
    if (!allowedRoles.includes(role)){
        // If cashier tries to access owner-only pages, redirect to POS
        if (role === "cashier") {
            return <Navigate to="/pos" replace />;
        }
        
        // If any other role (not owner or cashier), force logout
        useEffect(() => {
            const forceLogout = async () => {
                try {
                    await signOut(auth);
                } catch (error) {
                    console.error("Force logout error:", error);
                }
            };
            forceLogout();
        }, []);
        
        return (
            <div style={{ 
                padding: "2rem", 
                textAlign: "center", 
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                margin: "2rem"
            }}>
                <h3>Invalid Role</h3>
                <p>Your account has an invalid role. Logging out for security...</p>
            </div>
        );
    }

    return children;
}