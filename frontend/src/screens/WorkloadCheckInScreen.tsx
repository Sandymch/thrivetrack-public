import {
    ArrowRight,
    Lock,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createStatus,
    toDateInputValue,
    toTimeInputValue,
    type StatusMessage,
} from "../utils";
import {
    createWorkloadRecord,
    getWorkloadCategories,
} from "../services/api";
import NasaTlxScale, {
    INITIAL_NASA_TLX_RATINGS,
    type NasaTlxRatingKey,
    type NasaTlxRatings,
} from "../components/NasaTlxScale";

function WorkloadCheckInScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<StatusMessage>(
        createStatus("idle", "")
    );

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const [taskName, setTaskName] = useState("New Task");
    const [startDate, setStartDate] = useState(toDateInputValue(now));
    const [startTime, setStartTime] = useState(toTimeInputValue(now));
    const [endDate, setEndDate] = useState(toDateInputValue(oneHourLater));
    const [endTime, setEndTime] = useState(toTimeInputValue(oneHourLater));
    const [category, setCategory] = useState("Project Work");

    const { data: categoriesData } = useQuery({
        queryKey: ["workload-categories"],
        queryFn: getWorkloadCategories,
        staleTime: 30 * 60 * 1000,
    });

    const categoryOptions = categoriesData?.categories ?? [
        "Project Work",
        "Study",
        "Meetings",
    ];

    const [ratings, setRatings] = useState<NasaTlxRatings>(
        INITIAL_NASA_TLX_RATINGS
    );

    const [touchedRatings, setTouchedRatings] = useState<
        Partial<Record<NasaTlxRatingKey, boolean>>
    >({});

    const score = useMemo(() => {
        const values = Object.values(ratings);
        const total = values.reduce((sum, value) => sum + value, 0);

        return Number((total / values.length).toFixed(1));
    }, [ratings]);

    const completedDimensions = Object.values(touchedRatings).filter(
        Boolean
    ).length;

    const progress = Math.round((completedDimensions / 6) * 100);

    function updateRating(
        key: NasaTlxRatingKey,
        value: number
    ) {
        setRatings((currentRatings) => ({
            ...currentRatings,
            [key]: value,
        }));

        setTouchedRatings((currentTouchedRatings) => ({
            ...currentTouchedRatings,
            [key]: true,
        }));

        setStatus(createStatus("idle", ""));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (completedDimensions < 6) {
            setStatus(
                createStatus(
                    "error",
                    "Please rate all six dimensions before submitting."
                )
            );
            return;
        }

        try {
            const taskStartAt = new Date(`${startDate}T${startTime}:00`);
            const taskEndAt = new Date(`${endDate}T${endTime}:00`);

            if (taskEndAt <= taskStartAt) {
                setStatus(
                    createStatus(
                        "error",
                        "End time must be later than start time."
                    )
                );
                return;
            }

            const scaleTo100 = (value: number) => value * 10;

            const payload = {
                categoryName: category,
                taskName,
                taskStartAt: taskStartAt.toISOString(),
                taskEndAt: taskEndAt.toISOString(),
                ratings: {
                    mentalDemand: scaleTo100(ratings.mentalDemand),
                    physicalDemand: scaleTo100(ratings.physicalDemand),
                    temporalDemand: scaleTo100(ratings.temporalDemand),
                    performance: scaleTo100(ratings.performance),
                    effort: scaleTo100(ratings.effort),
                    frustration: scaleTo100(ratings.frustration),
                },
                rawTlxScore: scaleTo100(score),
            };

            await createWorkloadRecord(payload);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["workload-summary"],
                    exact: false,
                }),
                queryClient.invalidateQueries({
                    queryKey: ["workload-records"],
                    exact: false,
                }),
                queryClient.invalidateQueries({
                    queryKey: ["workload-categories"],
                    exact: false,
                }),
            ]);

            navigate("/dashboard/workload");
        } catch (error) {
            setStatus(
                createStatus(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Failed to save workload record."
                )
            );
        }
    }

    return (
        <form className="nasa-page" onSubmit={handleSubmit}>
            <section className="nasa-header">
                <div>
                    <h1>Raw NASA-TLX check-in</h1>
                    <p>
                        Rate your perceived workload for this task using the
                        NASA-TLX assessment.
                    </p>
                </div>
            </section>

            <div className="nasa-form-layout">
                <main className="nasa-main-column">
                    <section className="dashboard-card task-summary-card">
                        <div className="task-summary-grid">
                            <div className="task-summary-field task-summary-field-wide">
                                <label htmlFor="taskName">Task name</label>
                                <input
                                    id="taskName"
                                    value={taskName}
                                    onChange={(event) =>
                                        setTaskName(event.target.value)
                                    }
                                />
                            </div>

                            <div className="task-summary-field">
                                <label htmlFor="startDate">Start date</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                />
                            </div>

                            <div className="task-summary-field">
                                <label htmlFor="startTime">Start time</label>
                                <input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) =>
                                        setStartTime(event.target.value)
                                    }
                                />
                            </div>

                            <div className="task-summary-field">
                                <label htmlFor="category">Category</label>
                                <input
                                    id="category"
                                    list="category-options"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                    placeholder="Choose or enter a category"
                                />

                                <datalist id="category-options">
                                    {categoryOptions.map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        />
                                    ))}
                                </datalist>
                            </div>

                            <div className="task-summary-field">
                                <label htmlFor="endDate">End date</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                />
                            </div>

                            <div className="task-summary-field">
                                <label htmlFor="endTime">End time</label>
                                <input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(event) =>
                                        setEndTime(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    <NasaTlxScale
                        ratings={ratings}
                        onRatingChange={updateRating}
                    />

                    <section className="dashboard-card nasa-score-card">
                        <div className="nasa-score-title">
                            <div>
                                <strong>Your NASA-TLX score</strong>
                                <p>Average of all dimensions</p>
                            </div>
                        </div>

                        <div className="nasa-score-value">
                            <strong>{score}</strong>
                            <span>/10</span>
                            <em>Moderate</em>
                        </div>
                    </section>

                    {status.text && (
                        <div
                            className={`status-message ${status.type}`}
                            role="alert"
                            aria-live="polite"
                        >
                            <p>{status.text}</p>
                        </div>
                    )}

                    <section className="dashboard-card nasa-submit-card">
                        <div className="nasa-submit-actions">
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={() => navigate("/dashboard/workload")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="button-primary"
                                disabled={completedDimensions < 6}
                            >
                                Submit check-in
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        <p className="nasa-privacy-note">
                            <Lock size={16} />
                            Your responses are private and secure.
                        </p>
                    </section>
                </main>

                <aside className="nasa-side-column">
                    <section className="nasa-side-card">
                        <h2>How it works</h2>

                        <p>Rate each dimension from 0 to 10.</p>
                        <p>
                            <strong>0 = Very Low</strong>
                        </p>
                        <p>
                            <strong>10 = Very High</strong>
                        </p>

                        <p>
                            Your responses help you and your team build
                            healthier, more balanced workloads.
                        </p>
                    </section>

                    <section className="nasa-side-card">
                        <h2>Tips for accurate ratings</h2>

                        <ul>
                            <li>
                                Think about the entire task, not just one part.
                            </li>
                            <li>Trust your first reaction.</li>
                            <li>There are no right or wrong answers.</li>
                            <li>Be honest with yourself.</li>
                        </ul>
                    </section>

                    <section className="nasa-side-card nasa-progress-side-card">
                        <div>
                            <strong>
                                Progress: {completedDimensions}/6
                            </strong>
                            <span>dimensions rated</span>
                        </div>

                        <div className="nasa-progress-track">
                            <div
                                className="nasa-progress-fill"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </form>
    );
}

export default WorkloadCheckInScreen;