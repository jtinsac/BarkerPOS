import {createContext, useState, useEffect} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {ref, get} from "firebase/database";
import {auth, db} from "../lib/firebase";

export const UserContext = createContext(null);

export function UserProvider ({children}) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;

        const snapshot = await get(ref(db, "users/" + uid));

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setRole(userData.role);
        }

        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{user, role, loading}}>
        {children}
    </UserContext.Provider>
  )
}