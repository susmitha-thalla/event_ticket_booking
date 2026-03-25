import { useState } from "react";
import Navbar from "../components/Navbar";
import { createEvent } from "../services/eventService";

function CreateEventPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    eventDate: "",
    price: "",
    availableSeats: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const response = await createEvent({
        ...form,
        price: Number(form.price),
        availableSeats: Number(form.availableSeats),
      });
      alert(response);
    } catch (error) {
      console.error(error);
      alert(error.response?.data || error.message || "Event creation failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2>Create Event</h2>
          <form onSubmit={handleCreate}>
            <input name="title" placeholder="Title" onChange={handleChange} required />
            <input name="description" placeholder="Description" onChange={handleChange} required />
            <input name="location" placeholder="Location" onChange={handleChange} required />
            <input name="category" placeholder="Category" onChange={handleChange} required />
            <input name="eventDate" placeholder="2026-04-15T18:00:00" onChange={handleChange} required />
            <input name="price" placeholder="Price" onChange={handleChange} required />
            <input name="availableSeats" placeholder="Available Seats" onChange={handleChange} required />
            <button type="submit">Create Event</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateEventPage;