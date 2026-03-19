import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function ProtectRoute({children, allowedRoles}){
    const {user, role, loading} = useContext(UserContext);
    
    if(loading){
        return <p>Loading...</p>
    }

    if(!user){
        return <Navigate to="/login"/>
    }

    if (allowedRoles && !allowedRoles.includes(role)){
        return <p>Access Denied</p>
    }

    return children;
}