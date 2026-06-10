
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import InternshipDetail from "./pages/InternshipDetail";
import EmployerDashboard from "./pages/EmployerDashboard";   // employer + admin
import ApplicantDashboard from "./pages/ApplicantDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/internship/:id" element={<InternshipDetail />} />

            {/* Auth required (any role) */}
            <Route path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Applicant */}
            <Route path="/dashboard/applicant"
              element={
                <ProtectedRoute roles={["applicant"]}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              } />

            <Route path="/dashboard/employer"
              element={
                <ProtectedRoute roles={["employer", "admin"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } />
      
          </Routes>
        </main>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;