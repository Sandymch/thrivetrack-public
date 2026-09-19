import { createStatus, getErrorMessage, type StatusMessage } from "../utils";
import { useState } from "react";
import { signInWithEmailAndPassword } from "../services/auth";
import { useNavigate } from "react-router-dom";
import NewPasswordScreen from "./NewPasswordScreen";
import AuthLayout from "../components/AuthLayout";

function LoginScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    // Determines whether Cognito requires the user to create a new password.
    const [needNewPassword, setNeedNewPassword] = useState<boolean>(false);
    const [status, setStatus] = useState<StatusMessage>(createStatus("idle", ""));

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(createStatus("idle", ""));
        try {

            const result = await signInWithEmailAndPassword(email, password);

            // Switch to the mandatory password-change flow when required by Cognito.
            if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
                setNeedNewPassword(true);
                return;
            }
            navigate("/dashboard");
        } catch (error) {
            setStatus(createStatus("error", getErrorMessage(error)));
        }
    }

    if (needNewPassword) {
        return <NewPasswordScreen onNewPassSuccess={() => navigate("/dashboard")} />;
    }

    return (
        <AuthLayout>
            <div className="welcome-action-card">
                <form
                    className="registration-login-form"
                    onSubmit={handleLogin}
                >
                    <span className="action-label">Log In</span>

                    <h2>Log in account</h2>

                    <div className="form-field">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            type="text"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="button"
                        className="auth-text-button"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Forgot password?
                    </button>

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
                        >
                            Return
                        </button>

                        <button
                            type="submit"
                            className="button-primary"
                        >
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );

}

export default LoginScreen;