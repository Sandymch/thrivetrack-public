import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CalendarClock,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import {
  getCurrentUserProfile,
  clearCurrentSession,
} from "../services/auth";
import { formatLocalDate, formatLocalTime, formatScoreOutOf10 } from "../utils";
import { getDass21Summary, getWorkloadRecords, getWorkloadSummary } from "../services/api";
import WorkloadTrendChart from "../components/WorkloadTrendChart";
import WellbeingTrendChart from "../components/WellbeingTrendChart";

function DashboardScreen() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: getCurrentUserProfile,
    staleTime: 30 * 60 * 1000,
  });

  const firstName = profile?.firstName ?? "";
  const displayName = profile?.fullName ?? "Member";
  const avatarInitial =
    profile?.firstName?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "?";

  async function handleSignOut() {
    await clearCurrentSession();
    window.location.href = "/login";
  }

  const isDashboardHome =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/";

  return (
    <main className="dashboard-shell">
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""
          }`}
      >
        <div className="dashboard-logo">
          <span className="dashboard-logo-mark">T</span>

          <div>
            <strong>ThriveTrack</strong>
            <p>Wellbeing platform</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/dashboard/workload"
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Activity size={20} />
            <span>Workload</span>
          </NavLink>

          <NavLink
            to="/dashboard/wellbeing"
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <HeartPulse size={20} />
            <span>Wellbeing</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-support-card">
            <HeartPulse size={28} />

            <strong>Take a mindful pause</strong>

            <p>
              Small check-ins can help you understand your working
              patterns.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-signout"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-title">
            <button
              type="button"
              className="dashboard-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="dashboard-profile">
            <div className="dashboard-avatar">
              {avatarInitial}
            </div>

            <div className="dashboard-user">
              <strong>{displayName}</strong>
              <span>Member account</span>
            </div>
          </div>
        </header>

        {isDashboardHome ? (
          <DashboardOverview firstName={firstName} />
        ) : (
          <Outlet />
        )}
      </section>
    </main>
  );
}

type DashboardOverviewProps = {
  firstName: string;
};

function DashboardOverview({
  firstName,
}: DashboardOverviewProps) {
  const welcomeName = firstName || "there";
  const navigate = useNavigate();
  const [limit, setLimit] = useState(5);
  const [months, setMonths] = useState(1);

  const {
    data: workloadSummary,
    isError: isWorkloadSummaryError,
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

  const {
    data: wellbeingSummary,
    isError: isWellbeingSummaryError,
  } = useQuery({
    queryKey: ["dass21-summary", months],
    queryFn: () => getDass21Summary(months),
  });

  const recentRecords = recordsData?.records ?? [];

  const monthlyTaskCount =
    workloadSummary?.categoryDistribution.reduce(
      (total, category) => total + category.taskCount,
      0
    ) ?? 0;

  const averageWorkload =
    workloadSummary?.trend.length
      ? (
        workloadSummary.trend.reduce(
          (total, point) => total + point.averageScore * point.taskCount,
          0
        ) /
        workloadSummary.trend.reduce(
          (total, point) => total + point.taskCount,
          0
        )
      ).toFixed(1)
      : "—";

  const latestWellbeing = wellbeingSummary?.latestAssessment;

  const latestWellbeingValue = latestWellbeing
    ? `D ${latestWellbeing.scores.depression} · A ${latestWellbeing.scores.anxiety} · S ${latestWellbeing.scores.stress}`
    : "—";

  const latestWellbeingSubtitle = latestWellbeing
    ? `Completed on ${formatLocalDate(latestWellbeing.assessmentEndAt)}`
    : "No check-in recorded yet";

  let nextWellbeingValue = "Now";
  let nextWellbeingSubtitle = "Available now";

  if (latestWellbeing) {
    const nextDate = new Date(latestWellbeing.assessmentEndAt);
    nextDate.setDate(nextDate.getDate() + 7);

    if (new Date() < nextDate) {
      nextWellbeingValue = formatLocalDate(nextDate.toISOString());
      nextWellbeingSubtitle = "Available after 7 days";
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <header className="dashboard-topbar">
          <div>
            <h1>Welcome back, {welcomeName}</h1>
            <p>Here’s your overview for today.</p>
          </div>
        </header>
      </div>

      {isWorkloadSummaryError && (
        <div className="status-message error" role="alert">
          <p>Unable to load workload overview data.</p>
        </div>
      )}

      {isRecordsError && (
        <div className="status-message error" role="alert">
          <p>Unable to load recent workload records.</p>
        </div>
      )}

      {isWellbeingSummaryError && (
        <div className="status-message error" role="alert">
          <p>Unable to load wellbeing overview data.</p>
        </div>
      )}

      <section className="dashboard-summary-cards">
        <SummaryCard
          title={`Tasks in the past ${months === 1 ? "month" : `${months} months`}`}
          value={String(monthlyTaskCount)}
          unit="tasks"
          icon={<ListChecks size={26} />}
          tone="orange"
        />

        <SummaryCard
          title={`Workload in the past ${months === 1 ? "month" : `${months} months`}`}
          value={averageWorkload}
          unit={averageWorkload === "—" ? "" : "/10"}
          icon={<BarChart3 size={26} />}
          tone="purple"
        />

        <SummaryCard
          title="Latest wellbeing"
          value={latestWellbeingValue}
          subtitle={latestWellbeingSubtitle}
          icon={<HeartPulse size={26} />}
          tone="pink"
        />

        <SummaryCard
          title="Next wellbeing check-in"
          value={nextWellbeingValue}
          subtitle={nextWellbeingSubtitle}
          icon={<CalendarClock size={26} />}
          tone="peach"
        />
      </section>

      <section className="dashboard-chart">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Workload and Wellbeing trend</h2>
              <p>Your average data over the period</p>
            </div>

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

          <div className="workload-chart">
            <WorkloadTrendChart
              data={workloadSummary?.trend ?? []}
              selectedMonths={months}
            />
          </div>
          <div className="wellbeing-chart">
            <WellbeingTrendChart
              data={wellbeingSummary?.trend ?? []}
              selectedMonths={months}
            />
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
              <option value={5}>5 tasks</option>
              <option value={10}>10 tasks</option>
              <option value={20}>20 tasks</option>
              <option value={50}>50 tasks</option>
              <option value={100}>100 tasks</option>
            </select>
          </div>

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
                    <td colSpan={7}>Loading recent workload records...</td>
                  </tr>
                ) : recentRecords.length === 0 ? (
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

        <article className="dashboard-card quick-actions-card">
          <div className="dashboard-card-header">
            <h2>Quick actions</h2>
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

          <button
            type="button"
            className="quick-action quick-action-purple"
            onClick={() => navigate("/dashboard/wellbeing/new")}
          >
            <span>
              <HeartPulse size={26} />
            </span>

            <div>
              <strong>Start check-in</strong>
              <p>Check in on your workload or wellbeing</p>
            </div>
          </button>
        </article>
      </section>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  tone: "orange" | "purple" | "pink" | "peach";
};

function SummaryCard({
  title,
  value,
  unit = "",
  subtitle,
  icon,
  tone,
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span className={`summary-icon summary-icon-${tone}`}>
        {icon}
      </span>

      <div className="summary-card-content">
        <p>{title}</p>

        <div className="summary-value">
          <strong>{value}</strong>
          {unit && <span>{unit}</span>}
        </div>

        {subtitle && (
          <small className="summary-subtitle">
            {subtitle}
          </small>
        )}
      </div>
    </article>
  );
}


export default DashboardScreen;