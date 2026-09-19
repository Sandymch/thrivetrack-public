import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import WorkloadCategoryChart from "../components/WorkloadCategoryChart";
import WorkloadTrendChart from "../components/WorkloadTrendChart";
import {
  getWorkloadRecords, getWorkloadSummary,
} from "../services/api";
import { formatLocalDate, formatLocalTime, formatScoreOutOf10 } from "../utils";
import WorkloadCategoryTrendChart from "../components/WorkloadCategoryTrendChart";

function WorkLoadScreen() {
  const navigate = useNavigate();

  const [limit, setLimit] = useState(5);
  const [months, setMonths] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ["workload-summary", months],
    queryFn: () => getWorkloadSummary(months),
  });

  const {
    data: recordsData,
    isLoading: isLoadingRecords,
    isError: isRecordsError,
  } = useQuery({
    queryKey: ["workload-records", limit],
    queryFn: () => getWorkloadRecords(limit),
  });

  const recentRecords = recordsData?.records ?? [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <header className="dashboard-topbar">
          <div>
            <h1>Workload check-ins</h1>
            <p>Log your tasks and record workload for tracking.</p>
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
          <p>Loading workload summary...</p>
        </div>
      )}

      {isSummaryError && (
        <div className="status-message error" role="alert">
          <p>Unable to load workload summary</p>
        </div>
      )}

      <section className="dashboard-chart-grid">
        <WorkloadTrendChart
          data={summary?.trend ?? []}
          selectedMonths={months}
        />
        <WorkloadCategoryChart
          data={summary?.categoryDistribution ?? []}
          selectedMonths={months}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </section>

      <section className="dashboard-chart-grid">
        <WorkloadCategoryTrendChart
          data={summary?.categoryTrend ?? []}
          selectedMonths={months}
          selectedCategory={selectedCategory}
        />
        <article className="dashboard-card insight-card">
          <div className="insight-card-header">
            <h2>How to read this</h2>
            <span className="insight-badge">Non-diagnostic</span>
          </div>

          <p>
            These charts are designed to support self-reflection. They show patterns in
            your logged workload scores, but they do not assess health, performance, or
            wellbeing status.
          </p>

          <div className="insight-list">
            <div>
              <strong>Look for patterns</strong>
              <span>
                Notice which task categories tend to feel more demanding over time.
              </span>
            </div>

            <div>
              <strong>Compare context</strong>
              <span>
                A high score may reflect workload, deadlines, task complexity, or limited
                recovery time.
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent tasks</h2>

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
                  <th>Task Name</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>Start Time</th>
                  <th>End Date</th>
                  <th>End Time</th>
                  <th>Workload score</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingRecords ? (
                  <tr>
                    <td colSpan={7}>No recent workload records yet.</td>
                  </tr>
                ) : (
                  recentRecords.map((record) => (
                    <tr key={record.recordId}>
                      <td>{record.taskName}</td>
                      <td>{record.categoryName}</td>
                      <td>{formatLocalDate(record.taskStartAt)}</td>
                      <td>{formatLocalTime(record.taskStartAt)}</td>
                      <td>{formatLocalDate(record.taskEndAt)}</td>
                      <td>{formatLocalTime(record.taskEndAt)}</td>
                      <td>
                        <span className="score-pill score-high">
                          {formatScoreOutOf10(record.rawTlxScore)}/10
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card workload-action-card">
          <div className="dashboard-card-header">
            <h2>Quick action</h2>
          </div>

          <button
            type="button"
            className="quick-action quick-action-coral"
            onClick={() => navigate("/dashboard/workload/new")}
          >
            <span>
              <Plus size={26} />
            </span>

            <div>
              <strong>Log a task</strong>
              <p>Record a task and your workload level</p>
            </div>
          </button>
        </article>
      </section>
    </div>
  );
}

export default WorkLoadScreen;