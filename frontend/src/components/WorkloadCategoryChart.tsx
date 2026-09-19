import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { WorkloadCategoryDistribution } from "../services/api";

type ChartCategory = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

type WorkloadCategoryChartProps = {
  data: WorkloadCategoryDistribution[];
  selectedMonths: number;
  selectedCategory: string | null;
  onCategorySelect: (categoryName: string | null) => void;
};

const chartColors = [
  "#8D68C4",
  "#F58A7D",
  "#F7AE56",
  "#B99AD8",
  "#F8966C",
  "#B6D2ED",
  "#B3889E",
  "#EA5757",
  "#FCD3AF",
  "#FCD9DC",
];

function getStableColor(categoryName: string) {
  let hash = 0;

  for (let index = 0; index < categoryName.length; index += 1) {
    hash = categoryName.charCodeAt(index) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % chartColors.length;

  return chartColors[colorIndex];
}

function getPeriodLabel(months: number) {
  if (months === 1) {
    return "Past month";
  }

  return `Past ${months} months`;
}

function groupSmallCategories(data: ChartCategory[], maxCategories = 5) {
  if (data.length <= maxCategories) {
    return data;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const mainCategories = sorted.slice(0, maxCategories);
  const otherCategories = sorted.slice(maxCategories);

  const totalValue = sorted.reduce(
    (total, category) => total + category.value,
    0
  );

  const otherValue = otherCategories.reduce(
    (total, category) => total + category.value,
    0
  );

  const otherPercentage =
    totalValue > 0 ? Number(((otherValue / totalValue) * 100).toFixed(1)) : 0;

  return [
    ...mainCategories,
    {
      name: "Other",
      value: otherValue,
      percentage: otherPercentage,
      color: "#D8CDD4",
    },
  ];
}

function WorkloadCategoryChart({
  data,
  selectedMonths,
  selectedCategory,
  onCategorySelect,
}: WorkloadCategoryChartProps) {
  const rawChartData: ChartCategory[] = data.map((category) => ({
    name: category.categoryName,
    value: category.taskCount,
    percentage: category.percentage,
    color: getStableColor(category.categoryName),
  }));

  const chartData = groupSmallCategories(rawChartData, 5);

  const totalTasks = chartData.reduce(
    (total, category) => total + category.value,
    0
  );

  return (
    <article className="dashboard-card category-chart-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Workload by task category</h2>
          <p>Distribution of tasks logged in the selected period</p>
        </div>
      </div>

      {
        chartData.length === 0 ? (
          <div className="chart-placeholder">
            No category data for this period.
          </div>
        ) : (
          <div className="category-chart-layout">
            <div className="category-chart-visual">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    cornerRadius={6}
                    stroke="none"
                    onClick={(entry) => {
                      const categoryName = entry.name as string;

                      if (selectedCategory === categoryName) {
                        onCategorySelect(null);
                      } else {
                        onCategorySelect(categoryName);
                      }
                    }}
                  >
                    {chartData.map((category) => (
                      <Cell
                        key={category.name}
                        fill={category.color}
                        opacity={
                          selectedCategory === null || selectedCategory === category.name
                            ? 1
                            : 0.35
                        }
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={<CategoryTooltip total={totalTasks} />}
                  />

                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="category-chart-center-label"
                  >
                    {getPeriodLabel(selectedMonths)}
                  </text>

                  <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="category-chart-center-value"
                  >
                    {totalTasks} tasks
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="category-chart-details">
              <div className="category-chart-list">
                {chartData.map((category) => (
                  <div
                    className={`category-chart-row ${selectedCategory === category.name ? "category-chart-row-selected" : ""
                      }`}
                    key={category.name}
                    onClick={() => {
                      if (selectedCategory === category.name) {
                        onCategorySelect(null);
                      } else {
                        onCategorySelect(category.name);
                      }
                    }}
                  >
                    <div className="category-chart-name">
                      <span
                        className="category-chart-dot"
                        style={{
                          backgroundColor: category.color,
                        }}
                      />

                      <span>{category.name}</span>
                    </div>

                    <div className="category-chart-numbers">
                      <strong>{Math.round(category.percentage)}%</strong>
                      <span>({category.value})</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="category-chart-total">
                <strong>Total</strong>
                <span>{totalTasks} tasks</span>
              </div>
            </div>
          </div>
        )}
    </article>
  );
}

type TooltipPayloadItem = {
  name?: string;
  value?: number;
};

type CategoryTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  total: number;
};

function CategoryTooltip({
  active,
  payload,
  total,
}: CategoryTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const value = Number(item.value ?? 0);
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="category-chart-tooltip">
      <strong>{item.name}</strong>
      <span>
        {value} tasks · {percentage}%
      </span>
    </div>
  );
}

export default WorkloadCategoryChart;