import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Overview from "./pages/dashboard/Overview";
import DonorRegistration from "./pages/dashboard/DonorRegistration";
import PatientRequest from "./pages/dashboard/PatientRequest";
import EmergencyRequests from "./pages/dashboard/EmergencyRequests";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search mode="public" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="search-donors" element={<Search mode="dashboard" />} />
            <Route
              path="donor-registration"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="blood-request"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientRequest />
                </ProtectedRoute>
              }
            />
            <Route path="emergency-requests" element={<EmergencyRequests />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
