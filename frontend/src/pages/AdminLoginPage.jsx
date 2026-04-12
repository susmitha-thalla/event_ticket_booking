import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Navbar from "../components/Navbar";

const EMAIL_REGEX = /^[a-z0-9]+@[a-z0-9.-]+\.[a-z]{2,}$/;

function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "email" ? value.toLowerCase().replace(/\s+/g, "") : value;

    setErrorMsg("");
    setForm({ ...form, [name]: nextValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = form.email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg("Use a valid lowercase email address.");
      return;
    }

    try {
      const response = await loginUser({
        ...form,
        email: normalizedEmail,
        role: "ADMIN",
      });
      const token = response?.token || response?.accessToken || response?.jwt;
      if (!token) {
        setErrorMsg("Login response is missing token. Please try again.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", response?.role || "");
      localStorage.setItem("email", response?.email || "");

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
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              pattern="[a-z0-9]+@[a-z0-9.-]+\.[a-z]{2,}"
              title="Use lowercase letters and numbers before @ (example: user123@mail.com)."
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLoginPage;
