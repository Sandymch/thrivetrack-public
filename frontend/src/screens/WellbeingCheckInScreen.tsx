import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { createStatus, type StatusMessage } from "../utils";
import Dass21Questionnaire from "../components/Dass21Questionnaire";
import { createDass21Assessment } from "../services/api";
import {
    INITIAL_DASS21_RESPONSES,
    type Dass21QuestionKey,
    type Dass21Responses,
} from "../features/wellbeing/dass21";

function WellbeingCheckInScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [responses, setResponses] = useState<Dass21Responses>(
        INITIAL_DASS21_RESPONSES
    );

    const [status, setStatus] = useState<StatusMessage>(
        createStatus("idle", "")
    );

    const completedCount = Object.values(responses).filter(
        (value) => value !== null
    ).length;

    const isComplete = completedCount === 21;

    function handleResponseChange(
        key: Dass21QuestionKey,
        value: number
    ) {
        setResponses((currentResponses) => ({
            ...currentResponses,
            [key]: value,
        }));
    }

    function buildPayloadResponses() {
        const payloadResponses: Record<string, number> = {};

        Object.entries(responses).forEach(([key, value]) => {
            if (value !== null) {
                payloadResponses[key] = value;
            }
        });

        return payloadResponses;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isComplete) {
            setStatus(
                createStatus(
                    "error",
                    "Please answer all 21 items before submitting."
                )
            );
            return;
        }

        try {
            const result = await createDass21Assessment({
                responses: buildPayloadResponses(),
            });

            console.log("DASS-21 assessment saved:", result);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["dass21-summary"],
                    exact: false,
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dass21-assessments"],
                    exact: false,
                }),
            ]);

            setStatus(
                createStatus(
                    "success",
                    "Wellbeing check-in saved."
                )
            );

            navigate("/dashboard/wellbeing");
        } catch (error) {
            setStatus(
                createStatus(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Unable to save wellbeing check-in."
                )
            );
        }
    }

    return (
        <form className="wellbeing-page" onSubmit={handleSubmit}>
            <section className="wellbeing-header">
                <div>
                    <h1>DASS-21 wellbeing check-in</h1>
                    <p>
                        Think about how each statement has applied to you over
                        the past week.
                    </p>
                </div>
            </section>

            <div className="wellbeing-form-layout">
                <main className="wellbeing-main-column">
                    <section className="dashboard-card wellbeing-guidance-card">
                        <h2>Before you start</h2>
                        <p>
                            Read each statement and choose the option that best
                            describes how much it applied to you over the past week.
                            There are no right or wrong answers.
                        </p>
                    </section>

                    <Dass21Questionnaire
                        responses={responses}
                        onResponseChange={handleResponseChange}
                    />

                    {status.type !== "idle" && (
                        <div className={`form-status form-status-${status.type}`}>
                            {status.text}
                        </div>
                    )}

                    <section className="dashboard-card wellbeing-submit-card">
                        <div className="wellbeing-submit-actions">
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={() => navigate("/dashboard/wellbeing")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="button-primary"
                                disabled={!isComplete}
                            >
                                Submit check-in
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        <p className="wellbeing-privacy-note">
                            <Lock size={20} />
                            Your responses are private and secure.
                        </p>
                    </section>
                </main>

                <aside className="wellbeing-side-column">
                    <section className="dashboard-card wellbeing-note-card">
                        <h2>About this check-in</h2>
                        <p>
                            This check-in helps you track patterns over time. It is a
                            self-report tool and does not replace professional advice
                            or clinical assessment.
                        </p>
                    </section>

                    <section className="dashboard-card wellbeing-info-card">
                        <h2>How to answer</h2>

                        <ul className="wellbeing-info-points">
                            <li>Think about the past 7 days.</li>
                            <li>Trust your first reaction.</li>
                            <li>There are no right or wrong answers.</li>
                            <li>Be honest with yourself.</li>
                        </ul>
                    </section>

                    <section className="dashboard-card wellbeing-progress-card">
                        <div>
                            <h2>Progress: {completedCount}/21</h2>
                            <span>questions completed</span>
                        </div>

                        <div className="wellbeing-progress-track">
                            <div
                                className="wellbeing-progress-fill"
                                style={{
                                    width: `${(completedCount / 21) * 100}%`,
                                }}
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </form>
    );
}

export default WellbeingCheckInScreen;