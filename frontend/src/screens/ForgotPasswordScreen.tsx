import {
    confirmPasswordReset,
    requestPasswordReset,
    validatePassword,
} from "../services/auth";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStatus, type StatusMessage } from '../utils';
import AuthLayout from '../components/AuthLayout';

type ResetStep = "request-code" | "confirm-code";

function ForgotPasswordScreen() {
    const navigate = useNavigate();

    const [step, setStep] = useState<ResetStep>("request-code");
    const [email, setEmail] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<StatusMessage>(
        createStatus("idle", "")
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleRequestCode(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setStatus(createStatus("idle", ""));

            await requestPasswordReset(email.trim());

            setStep("confirm-code");
            setStatus(
                createStatus(
                    "success",
                    "A password reset code has been sent to your email address."
                )
            );
        } catch (error) {
            setStatus(
                createStatus(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Unable to request password reset. Please try again later."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleConfirmReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setStatus(createStatus("idle", ""));

        const validationMessage = validatePassword(newPassword);

        if (validationMessage) {
            setStatus(createStatus("error", validationMessage));
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus(
                createStatus("error", "Passwords do not match.")
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await confirmPasswordReset(
                email,
                confirmationCode,
                newPassword
            );

            setStatus(
                createStatus(
                    "success",
                    "Your password has been reset successfully. You can now log in with your new password."
                )
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            setStatus(
                createStatus(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Unable to reset password. Please try again later."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <div className="welcome-action-card">
                {step === "request-code" ? (
                    <form
                        className="registration-login-form"
                        onSubmit={handleRequestCode}
                    >
                        <span className="action-label">
                            Password recovery
                        </span>

                        <h2>Forgot Password?</h2>

                        <p className="action-description">
                            Enter your email address and we'll send you a password reset code.
                        </p>

                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        {status.text && (
                            <div
                                className={`status-message ${status.type}`}
                                role="alert"
                                aria-live="polite"
                            >
                                <p>{status.text}</p>
                            </div>
                        )}

                        <div className="button-row button-row-single">
                            <button
                                type="button"
                                className="auth-text-button"
                                onClick={() => navigate("/login")}
                            >
                                Back to sign in
                            </button>
                        </div>
                    </form>
                ) : (
                    <form
                        className="registration-login-form"
                        onSubmit={handleConfirmReset}
                    >
                        <span className="action-label">
                            Verification required
                        </span>

                        <h2>Reset your password</h2>

                        <p className="action-description">
                            Enter the confirmation code from your email and
                            choose a new password.
                        </p>

                        <div className="form-field">
                            <label htmlFor="emailConfirm">Email</label>

                            <input
                                id="emailConfirm"
                                name="emailConfirm"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirmationCode">
                                Confirmation code
                            </label>

                            <input
                                id="confirmationCode"
                                name="confirmationCode"
                                value={confirmationCode}
                                onChange={(event) =>
                                    setConfirmationCode(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="password-requirements">
                            <p>Your password must contain:</p>

                            <ul>
                                <li>At least 8 characters</li>
                                <li>At least one number</li>
                                <li>At least one special character</li>
                                <li>At least one uppercase letter</li>
                                <li>At least one lowercase letter</li>
                            </ul>
                        </div>

                        <div className="form-field">
                            <label htmlFor="newPassword">
                                New password
                            </label>

                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirmPassword">
                                Confirm new password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                minLength={8}
                                required
                            />
                        </div>

                        {status.text && (
                            <div
                                className={`status-message ${status.type}`}
                                role="alert"
                                aria-live="polite"
                            >
                                <p>{status.text}</p>
                            </div>
                        )}

                        <div className="button-row button-row-single">
                            <button
                                type="submit"
                                className="button-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Resetting password..."
                                    : "Reset password"}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="auth-text-button"
                            onClick={() => setStep("request-code")}
                        >
                            Send code again
                        </button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}

export default ForgotPasswordScreen;