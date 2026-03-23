import {createContext, useState, useEffect} from "react";
import {onAuthStateChanged} from "firebase/auth";
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
            setRole(dbUserData.role);
            setUserData(dbUserData);
          } else {
            // User exists in auth but not in database
            setRole(null);
            setUserData(null);
          }

          setUser(firebaseUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
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