import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Navbar from "../components/Navbar";

function OrganizerLoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "ORGANIZER",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setErrorMsg("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("userCode");
    localStorage.removeItem("accountStatus");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await loginUser(form);

      if (!response?.token) {
        throw new Error("Token not received from server");
      }

      const role = response.role?.toUpperCase();

      if (role !== "ORGANIZER" && role !== "ROLE_ORGANIZER") {
        clearSession();
        setErrorMsg("This account is not an organizer account.");
        setLoading(false);
        return;
      }

      if (response.accountStatus && response.accountStatus.toUpperCase() !== "ACTIVE") {
        clearSession();
        setErrorMsg("Your account is not active.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role || "ORGANIZER");
      localStorage.setItem("email", response.email || "");
      localStorage.setItem("userId", response.userId ?? "");
      localStorage.setItem("userCode", response.userCode ?? "");
      localStorage.setItem("accountStatus", response.accountStatus ?? "ACTIVE");

      navigate("/organizer/dashboard");
    } catch (error) {
      console.error("Organizer login failed:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Organizer login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <div className="card auth-card">
          <h2>Organizer Login</h2>
          <p className="subtext">Access your dashboard to create and manage events.</p>

          {errorMsg && <div className="message-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
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
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default OrganizerLoginPage;