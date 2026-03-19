import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {ref, set} from "firebase/database";
import { auth, db, firebaseConfig } from "../../lib/firebase";
import {initializeApp, deleteApp} from "firebase/app";
import { getAuth } from "firebase/auth";

function CreateUserForm(){

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [role, setRole] = useState("");
const [error, setError] = useState("");


async function handleSubmit(e) {
  e.preventDefault();
  if (!email || !password || !role){
    setError("Please fill all fields");
    return;
  }

  try {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");

      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email, 
        password
      
    );

    const uid = userCredential.user.uid;

    await set(ref(db, "users/" + uid), {
      email: email,
      role: role,
      createdAt: Date.now(),

      
    });

    await deleteApp(secondaryApp);

    console.log("User created:", uid);

  setEmail("");
  setPassword("");
  setRole("");
  setError("");

  } catch (error) {
    console.error("Error creating user:", error.message);

  setEmail("");
  setPassword("");
  setRole("");
  setError("");
  }
}


    return(
        <form onSubmit={handleSubmit}>
            <h2>Create User</h2>
            {error && <p>{error}</p>}

            <input type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword (e.target.value)}/>

            <select value={role} onChange={(e) => setRole (e.target.value)}>
                <option value="">Select Role</option>
                <option value="owner">Owner</option>
                <option value="cashier">Cashier</option>
            </select>

            <button type="submit">Submit</button>

        </form>
    );
}

export default CreateUserForm