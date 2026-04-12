import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import Navbar from "../components/Navbar";

const EMAIL_REGEX = /^[a-z0-9]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const NAME_REGEX = /^[A-Za-z ]+$/;

function UserSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "email") {
      nextValue = value.toLowerCase().replace(/\s+/g, "");
    }

    if (name === "fullName") {
      nextValue = value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ");
    }

    setErrorMsg("");
    setMessage("");
    setForm({ ...form, [name]: nextValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedName = form.fullName.trim().replace(/\s{2,}/g, " ");
    const normalizedEmail = form.email.toLowerCase().trim();

    if (!NAME_REGEX.test(normalizedName)) {
      setErrorMsg("Full Name can contain only letters and spaces.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg("Email must use lowercase letters and numbers before @.");
      return;
    }

    if ((form.password || "").length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    try {
      const registerResponse = await registerUser({
        ...form,
        fullName: normalizedName,
        email: normalizedEmail,
      });
      const registerMessage =
        typeof registerResponse === "string"
          ? registerResponse
          : registerResponse?.message || "";

      if (!/registered successfully/i.test(registerMessage)) {
        throw new Error(registerMessage || "Signup failed");
      }

      setMessage("Signup successful. Logging you in...");

      const loginResponse = await loginUser({
        email: normalizedEmail,
        password: form.password,
        role: "USER",
      });

      const token = loginResponse?.token || loginResponse?.accessToken || loginResponse?.jwt;
      if (!token) {
        throw new Error("Login token missing after signup.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", loginResponse?.role || "USER");
      localStorage.setItem("email", loginResponse?.email || normalizedEmail);
      sessionStorage.setItem("welcome_user", normalizedName || "User");

      navigate("/events");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data || error.message || "Signup failed"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <div className="card auth-card">
          <h2>User Signup</h2>
          <p className="subtext">Create your account to browse and book approved events.</p>

          {message && <div className="message-success">{message}</div>}
          {errorMsg && <div className="message-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              pattern="[A-Za-z ]+"
              title="Only letters and spaces are allowed."
              required
            />
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
              minLength={8}
              required
            />
            <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
            <button type="submit">Signup</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default UserSignupPage;
