import { useState } from "react";
import { registerUser } from "../services/authService";
import Navbar from "../components/Navbar";

function OrganizerSignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "ORGANIZER",
    organizationName: "",
    city: "",
  });

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setErrorMsg("");
    setMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const response = await registerUser(form);
      setMessage(typeof response === "string" ? response : "Organizer signup successful");
      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "ORGANIZER",
        organizationName: "",
        city: "",
      });
    } catch (error) {
      console.error("Organizer signup failed:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Organizer signup failed"
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
          <h2>Organizer Signup</h2>
          <p className="subtext">Create your organizer account to host and manage events.</p>

          {message && <div className="message-success">{message}</div>}
          {errorMsg && <div className="message-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
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
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              name="organizationName"
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default OrganizerSignupPage;