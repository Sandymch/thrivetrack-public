import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { CategoryTrendPoint } from "../services/api";

type WorkloadCategoryTrendChartProps = {
    data: CategoryTrendPoint[];
    selectedMonths: number;
    selectedCategory: string | null;
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

    return chartColors[Math.abs(hash) % chartColors.length];
}

function getCategoryKeys(data: CategoryTrendPoint[]) {
    const keys = new Set<string>();

    data.forEach((point) => {
        Object.keys(point).forEach((key) => {
            if (key !== "periodStart") {
                keys.add(key);
            }
        });
    });

    return Array.from(keys);
}

function getPeriodLabel(months: number) {
    return months === 1 ? "Past month" : `Past ${months} months`;
}

function WorkloadCategoryTrendChart({
    data,
    selectedMonths,
    selectedCategory,
}: WorkloadCategoryTrendChartProps) {
    const filteredData = selectedCategory
        ? data.filter((point) => typeof point[selectedCategory] === "number")
        : data;

    const categoryKeys = selectedCategory
        ? [selectedCategory]
        : getCategoryKeys(filteredData);

    return (
        <article className="dashboard-card">
            <div className="dashboard-card-header">
                <div>
                    <h2>
                        {selectedCategory
                            ? `${selectedCategory} workload trend`
                            : "Workload trend by category"}
                    </h2>
                    <p>
                        {selectedCategory
                            ? `Average workload score for ${selectedCategory} over ${getPeriodLabel(
                                selectedMonths
                            ).toLowerCase()}`
                            : `Average workload score by task category over ${getPeriodLabel(
                                selectedMonths
                            ).toLowerCase()}`}
                    </p>
                </div>
            </div>

            {filteredData.length === 0 || categoryKeys.length === 0 ? (
                <div className="chart-placeholder">
                    No category trend data for this period.
                </div>
            ) : (
                <div className="workload-line-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={filteredData}
                            margin={{
                                top: 12,
                                right: 24,
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

                            <Tooltip />

                            {categoryKeys.map((categoryName) => (
                                <Line
                                    key={categoryName}
                                    type="monotone"
                                    dataKey={categoryName}
                                    stroke={getStableColor(categoryName)}
                                    strokeWidth={3}
                                    dot={{
                                        r: 4,
                                        strokeWidth: 2,
                                    }}
                                    activeDot={{
                                        r: 6,
                                    }}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </article>
    );
}

export default WorkloadCategoryTrendChart;