import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllUsers } from "../services/adminService";

function AllUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load users");
      }
    };

    loadUsers();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>All Users</h2>

        {users.map((user) => (
          <div className="card" key={user.userId}>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.accountStatus}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default AllUsersPage;