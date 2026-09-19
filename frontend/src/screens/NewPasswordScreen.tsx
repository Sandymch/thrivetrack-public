import {
    completeNewPasswordChallenge,
    validatePassword,
} from "../services/auth";

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import {
    createStatus,
    getErrorMessage,
    type StatusMessage,
} from "../utils";

type NewPasswordScreenProps = {
    onNewPassSuccess: () => void;
};

function NewPasswordScreen({
    onNewPassSuccess,
}: NewPasswordScreenProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [status, setStatus] = useState<StatusMessage>(
        createStatus("idle", "")
    );

    async function handleNewPassword(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setStatus(createStatus("idle", ""));

        const validationMessage = validatePassword(password);

        if (validationMessage) {
            setStatus(createStatus("error", validationMessage));
            return;
        }

        if (password !== confirmPassword) {
            setStatus(
                createStatus("error", "Passwords do not match.")
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await completeNewPasswordChallenge(password);

            if (result.isSignedIn) {
                onNewPassSuccess();
                return;
            }

            setStatus(
                createStatus(
                    "error",
                    `Additional sign-in step required: ${result.nextStep.signInStep}`
                )
            );
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
                    onSubmit={handleNewPassword}
                >
                    <span className="action-label">
                        New password setting
                    </span>

                    <h2>Create a new password</h2>

                    <p className="action-description">
                        Your temporary password must be replaced before you can
                        continue.
                    </p>

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
                        <label htmlFor="password">
                            New password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
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
                                ? "Setting password..."
                                : "Set password"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}

export default NewPasswordScreen;