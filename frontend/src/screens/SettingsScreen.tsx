import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    deleteAccountData,
} from "../services/api";

import {
    deleteCurrentUser,
    getCurrentUserProfile,
} from "../services/auth";
import {
    createStatus,
    getErrorMessage,
    type StatusMessage,
} from "../utils";

function SettingsScreen() {
    const navigate = useNavigate();

    const [confirmationText, setConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [status, setStatus] = useState<StatusMessage>(
        createStatus("idle", "")
    );

    const canDelete = confirmationText === "DELETE" && !isDeleting;

    const {
        data: profile,
        isLoading: isLoadingProfile,
        isError: isProfileError,
    } = useQuery({
        queryKey: ["current-user-profile"],
        queryFn: getCurrentUserProfile,
        staleTime: 30 * 60 * 1000,
    });

    async function handleDeleteAccount() {
        if (confirmationText !== "DELETE") {
            setStatus(
                createStatus(
                    "error",
                    "Please type DELETE to confirm account deletion."
                )
            );
            return;
        }

        setIsDeleting(true);
        setStatus(createStatus("idle", ""));

        try {
            await deleteAccountData();
            await deleteCurrentUser();

            navigate("/");
        } catch (error) {
            setStatus(
                createStatus(
                    "error",
                    getErrorMessage(error)
                )
            );
        } finally {
            setIsDeleting(false);
        }

    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-content">
                <header className="dashboard-topbar">
                    <div>
                        <h1>Account settings</h1>
                        <p>Manage your account and data preferences.</p>
                    </div>
                </header>

                <section className="dashboard-card settings-section-card">
                    <div className="dashboard-card-header">
                        <div>
                            <h2>Account information</h2>
                            <p>Your ThriveTrack account details.</p>
                        </div>
                    </div>


                    {isLoadingProfile ? (
                        <p>Loading account information...</p>
                    ) : isProfileError ? (
                        <p>Unable to load account information.</p>
                    ) : (
                        <div className="account-info-list">
                            <div className="account-info-row">
                                <span>Name</span>
                                <strong>{profile?.fullName ?? "Member"}</strong>
                            </div>

                            <div className="account-info-row">
                                <span>Email</span>
                                <strong>{profile?.email ?? "Not available"}</strong>
                            </div>
                        </div>
                    )}
                </section>

                {/*
                    Email reminder section is hidden in the public demo.
                    See docs/email-reminder-demo-note.md for implementation details.
                */}

                <section className="dashboard-card danger-zone-card">
                    <div className="dashboard-card-header">
                        <div>
                            <h2 className="danger-title">
                                Delete account
                            </h2>
                            <p>
                                Permanently delete your account and all stored
                                ThriveTrack data.
                            </p>
                        </div>
                    </div>

                    <div className="danger-zone-warning">
                        <span>
                            <AlertTriangle size={24} />
                        </span>

                        <div>
                            <strong>This action cannot be undone.</strong>
                            <p>
                                This will delete your workload records,
                                workload categories, wellbeing check-ins,
                                DASS-21 responses, and your Cognito account.
                            </p>
                        </div>
                    </div>

                    <div className="danger-zone-content">
                        <div className="form-field">
                            <label htmlFor="deleteConfirm">
                                Type DELETE to confirm
                            </label>

                            <input
                                id="deleteConfirm"
                                value={confirmationText}
                                onChange={(event) =>
                                    setConfirmationText(event.target.value)
                                }
                                placeholder="DELETE"
                                disabled={isDeleting}
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

                        <button
                            type="button"
                            className="button-danger"
                            onClick={handleDeleteAccount}
                            disabled={!canDelete}
                        >
                            <Trash2 size={20} />
                            {isDeleting
                                ? "Deleting account..."
                                : "Delete my account"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
export default SettingsScreen;