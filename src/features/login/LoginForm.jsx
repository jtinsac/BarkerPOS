import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [ error, setError] = useState("");
const navigate = useNavigate();

async function handleSubmit(e) {
  e.preventDefault();

  setIsLoading(true);
  setError("");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in user:", userCredential.user);
    navigate("/dashboard");
    } catch(error) {
      setError(error.message);
    }
    finally {
      setIsLoading(false);
    }
  }


  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

    {error && <p>{error}</p>}
      <input 
      type="email"
      placeholder="Email"
      value={email} 
      onChange={(e) => setEmail(e.target.value)}
      />

      <input 
      type="password" 
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}