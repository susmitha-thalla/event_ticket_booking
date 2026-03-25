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
  });
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");
    setMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(form);
      setMessage(response);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data || "Organizer signup failed");
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
            <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
            <input name="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
            <button type="submit">Signup</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default OrganizerSignupPage;