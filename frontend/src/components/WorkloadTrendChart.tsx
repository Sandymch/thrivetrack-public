import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import type { WorkloadTrendPoint } from "../services/api";

type WorkloadTrendChartProps = {
  data: WorkloadTrendPoint[];
  selectedMonths: number;
};

function getPeriodLabel(months: number) {
  if (months === 1) {
    return "Past month";
  }

  return `Past ${months} months`;
}

function WorkloadTrendChart({
  data,
  selectedMonths,
}: WorkloadTrendChartProps) {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Workload trend</h2>
          <p>Average workload score over {getPeriodLabel(selectedMonths).toLowerCase()}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="chart-placeholder">
          No workload trend data for this period.
        </div>
      ) : (
        <div className="workload-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 12,
                right: 18,
                bottom: 8,
                left: 0,
              }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} />

              <XAxis
                dataKey="periodStart"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tickCount={6}
              />

              <Tooltip content={<TrendTooltip />} />

              <Line
                type="monotone"
                dataKey="averageScore"
                strokeWidth={4}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

type TrendTooltipPayloadItem = {
  value?: number;
  payload?: WorkloadTrendPoint;
};

type TrendTooltipProps = {
  active?: boolean;
  payload?: TrendTooltipPayloadItem[];
  label?: string;
};

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const value = Number(item.value ?? 0);
  const taskCount = item.payload?.taskCount ?? 0;

  return (
    <div className="category-chart-tooltip">
      <strong>{label}</strong>
      <span>
        Average score: {value.toFixed(1)}/10
      </span>
      <span>
        {taskCount} tasks
      </span>
    </div>
  );
}

export default WorkloadTrendChart;