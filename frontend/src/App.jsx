import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserSignupPage from "./pages/UserSignupPage";
import UserLoginPage from "./pages/UserLoginPage";
import OrganizerSignupPage from "./pages/OrganizerSignupPage";
import OrganizerLoginPage from "./pages/OrganizerLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import EventsPage from "./pages/EventsPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import OrganizerBookingsPage from "./pages/OrganizerBookingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AllUsersPage from "./pages/AllUsersPage";
import AllEventsPage from "./pages/AllEventsPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingSuccessPage from "./pages/BookingSuccessPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/user/login" element={<UserLoginPage />} />

        <Route path="/organizer/signup" element={<OrganizerSignupPage />} />
        <Route path="/organizer/login" element={<OrganizerLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="/events" element={<EventsPage />} />

        <Route
          path="/book"
          element={
            <ProtectedRoute allowedRoles={["USER", "ROLE_USER"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={["USER", "ROLE_USER"]}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-success"
          element={
            <ProtectedRoute allowedRoles={["USER", "ROLE_USER"]}>
              <BookingSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZER", "ROLE_ORGANIZER"]}>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/create-event"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZER", "ROLE_ORGANIZER"]}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/my-events"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZER", "ROLE_ORGANIZER"]}>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/bookings"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZER", "ROLE_ORGANIZER"]}>
              <OrganizerBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]}>
              <AllUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]}>
              <AllEventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]}>
              <AllBookingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;