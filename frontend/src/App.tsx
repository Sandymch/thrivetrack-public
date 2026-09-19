import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";

import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import WorkLoadScreen from "./screens/WorkLoadScreen";
import WorkloadCheckInScreen from "./screens/WorkloadCheckInScreen";
import AuthLayout from "./components/AuthLayout";
import SettingsScreen from "./screens/SettingsScreen";
import WellbeingScreen from "./screens/WellbeingScreen";
import WellbeingCheckInScreen from "./screens/WellbeingCheckInScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <main className="app-container">
        <p>Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function WelcomeScreen() {
  const navigate = useNavigate();

  const [showRegisterSuccess] = useState<boolean>(
    sessionStorage.getItem("showRegisterSuccess") === "true"
  );

  useEffect(() => {
    if (showRegisterSuccess) {
      sessionStorage.removeItem("showRegisterSuccess");
    }
  }, [showRegisterSuccess]);

  return (
    <AuthLayout>
      <div className="welcome-action-card">
        <span className="action-label">Welcome</span>

        <h2>Welcome to ThriveTrack</h2>

        <p className="action-description">
          Sign in to continue tracking your workload and wellbeing.
        </p>

        {showRegisterSuccess && (
          <div className="status-message success">
            <strong>Registration successful</strong>

            <p>
              Please check your email for your temporary password, then use
              it to log in.
            </p>
          </div>
        )}
        <br/>
        <div className="welcome-buttons">
          <button
            type="button"
            className="button-primary"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </div>

        <div className="action-divider">
          <span />
          <p>Thrive at your own pace</p>
          <span />
        </div>

        <div className="privacy-note">
          <span aria-hidden="true">✓</span>

          <p>
            Your personal tracking information is kept private and secure.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        }
      >
        <Route path="workload" element={<WorkLoadScreen />} />
        <Route path="workload/new" element={<WorkloadCheckInScreen />} />
        <Route path="wellbeing" element={<WellbeingScreen />} />
        <Route path="wellbeing/new" element={<WellbeingCheckInScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App