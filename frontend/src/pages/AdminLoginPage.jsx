import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Navbar from "../components/Navbar";

function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setErrorMsg("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(form);
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("email", response.email);

      if (response.role === "ADMIN" || response.role === "ROLE_ADMIN") {
        navigate("/admin/dashboard");
      } else {
        setErrorMsg("This account is not an admin account.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data || error.message || "Admin login failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <div className="card auth-card">
          <h2>Admin Login</h2>
          <p className="subtext">Manage platform approvals, users, events, and bookings.</p>

          {errorMsg && <div className="message-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <input name="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLoginPage;