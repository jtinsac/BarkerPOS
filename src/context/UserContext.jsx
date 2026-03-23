import {createContext, useState, useEffect} from "react";
import {onAuthStateChanged, signOut} from "firebase/auth";
import {ref, get} from "firebase/database";
import {auth, db} from "../lib/firebase";

export const UserContext = createContext(null);

export function UserProvider ({children}) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Add userData state
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const uid = firebaseUser.uid;
          const snapshot = await get(ref(db, "users/" + uid));

          if (snapshot.exists()) {
            const dbUserData = snapshot.val();
            
            // Check if user has valid role
            if (dbUserData.role && (dbUserData.role === 'owner' || dbUserData.role === 'cashier')) {
              setRole(dbUserData.role);
              setUserData(dbUserData);
              setUser(firebaseUser);
            } else {
              // Invalid role - sign out user
              console.warn("User has invalid role:", dbUserData.role);
              await signOut(auth);
              setUser(null);
              setUserData(null);
              setRole(null);
            }
          } else {
            // User exists in auth but not in database - sign them out
            console.warn("User authenticated but no database record found. Signing out.");
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // On error, sign out user for security
          await signOut(auth);
          setUser(null);
          setRole(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{user, userData, role, loading}}>
        {children}
    </UserContext.Provider>
  )
}