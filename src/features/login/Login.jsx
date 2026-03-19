import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import LoginForm from "./LoginForm";

function Login() {
  const { user, role, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {

      if (role === "owner") {
        navigate("/dashboard");
      }

      if (role === "cashier") {
        navigate("/pos");
      }

    }
  }, [user, role, loading]);

  return <LoginForm />;
}

export default Login;