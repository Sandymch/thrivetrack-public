import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createStatus,
  getErrorMessage,
  type StatusMessage,
} from "../utils";
import AuthLayout from "../components/AuthLayout";

function RegisterScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<StatusMessage>(
    createStatus("idle", "")
  );

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus(createStatus("idle", ""));
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/register-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      sessionStorage.setItem("showRegisterSuccess", "true");
      navigate("/");
    } catch (error) {
      setStatus(
        createStatus("error", getErrorMessage(error))
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="welcome-action-card">
        <form
          className="registration-login-form"
          onSubmit={handleRegister}
        >
          <span className="action-label">Registration</span>

          <h2>Create account</h2>

          <p className="action-description">
            To continue tracking your workload and
            wellbeing.
          </p>

          <div className="form-field">
            <label htmlFor="firstName">First name</label>

            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Last name</label>

            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          {status.text && (
            <div
              className={`status-message ${status.type}`}
              role="alert"
            >
              <p>{status.text}</p>
            </div>
          )}

          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Return
            </button>

            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default RegisterScreen;