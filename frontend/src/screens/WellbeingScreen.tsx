import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    getDass21Assessments,
    getDass21Summary,
} from "../services/api";
import { formatLocalDate } from "../utils";
import WellbeingTrendChart from "../components/WellbeingTrendChart";

function WellbeingScreen() {
    const navigate = useNavigate();
    const [limit, setLimit] = useState(5);
    const [months, setMonths] = useState(1);

    const {
        data: summary,
        isLoading: isLoadingSummary,
        error: isSummaryError,
    } = useQuery({
        queryKey: ["dass21-summary", months],
        queryFn: () => getDass21Summary(months),
    });

    const {
        data: recordsData,
        isLoading: isLoadingRecords,
        isError: isRecordsError,
    } = useQuery({
        queryKey: ["dass21-assessments", limit],
        queryFn: () => getDass21Assessments(limit),
    });

    const recentRecords = recordsData?.records ?? [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-hero">
                <header className="dashboard-topbar">
                    <div>
                        <h1>DASS-21 wellbeing check-ins</h1>
                        <p>Think about how have you felt over the past week, and record for tracking.</p>
                        <br />
                        <select
                            aria-label="Workload chart period"
                            value={months}
                            onChange={(event) => setMonths(Number(event.target.value))}
                        >
                            <option value={1}>1 month</option>
                            <option value={3}>3 months</option>
                            <option value={6}>6 months</option>
                            <option value={12}>12 months</option>
                        </select>
                    </div>
                </header>
            </div>

            {isLoadingSummary && (
                <div className="status-message info">
                    <p>Loading wellbeing summary...</p>
                </div>
            )}

            {isSummaryError && (
                <div className="status-message error" role="alert">
                    <p>Unable to load wellbeing summary</p>
                </div>
            )}

            <section className="dashboard-chart-grid">
                <WellbeingTrendChart
                    data={summary?.trend ?? []}
                    selectedMonths={months}
                />
                <article className="dashboard-card insight-card">
                    <div className="insight-card-header">
                        <h2>How to read this</h2>
                        <span className="insight-badge">Non-diagnostic</span>
                    </div>

                    <p>
                        Each DASS-21 subscale ranges from 0 to 42. Lower scores usually
                        suggest fewer recent symptoms, while higher scores suggest stronger
                        recent symptoms in that area. These charts are for self-reflection only
                        and do not diagnose mental health conditions.
                    </p>

                    <div className="insight-list">
                        <div>
                            <strong>Lower range</strong>
                            <span>
                                Scores closer to 0 suggest the symptoms were reported less often
                                over the past week.
                            </span>
                        </div>

                        <div>
                            <strong>Middle range</strong>
                            <span>
                                Scores in the middle suggest symptoms appeared more noticeably
                                and may be worth monitoring over time.
                            </span>
                        </div>

                        <div>
                            <strong>Higher range</strong>
                            <span>
                                Scores closer to 42 suggest stronger recent symptoms. Consider
                                seeking support if high scores continue or feel concerning.
                            </span>
                        </div>
                    </div>
                </article>
            </section>

            <section className="dashboard-bottom-grid">
                <article className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Recent wellbeing records</h2>

                        <select
                            aria-label="Workload table number of tasks to show"
                            defaultValue="5"
                            onChange={(event) => setLimit(Number(event.target.value))}
                        >
                            <option value="5">5 tasks</option>
                            <option value="10">10 tasks</option>
                            <option value="20">20 tasks</option>
                            <option value="50">50 tasks</option>
                            <option value="100">100 tasks</option>
                        </select>
                    </div>

                    {isRecordsError && (
                        <div className="status-message error" role="alert">
                            <p>Unable to load recent workload records</p>
                        </div>
                    )}


                    <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Depression</th>
                                    <th>Anxiety</th>
                                    <th>Stress</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoadingRecords ? (
                                    <tr>
                                        <td colSpan={4}>No records found</td>
                                    </tr>
                                ) : (
                                    recentRecords.map((record) => (
                                        <tr key={record.assessmentId}>
                                            <td>{formatLocalDate(record.assessmentStartAt)}</td>
                                            <td>{record.scores.depression}</td>
                                            <td>{record.scores.anxiety}</td>
                                            <td>{record.scores.stress}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                <article className="dashboard-card wellbeing-action-card">
                    <div className="dashboard-card-header">
                        <h2>Quick action</h2>
                    </div>

                    <button
                        type="button"
                        className="quick-action quick-action-purple"
                        onClick={() => navigate("/dashboard/wellbeing/new")}
                    >
                        <span>
                            <Plus size={26} />
                        </span>

                        <div>
                            <strong>Log a wellbeing record</strong>
                            <p>Record your current wellbeing check-in</p>
                        </div>
                    </button>
                </article>
            </section>
        </div>
    );
}
export default WellbeingScreen;