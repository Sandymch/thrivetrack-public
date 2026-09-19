import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { Dass21TrendPoint } from "../services/api";

type WellbeingTrendChartProps = {
    data: Dass21TrendPoint[];
    selectedMonths: number;
};

function getPeriodLabel(selectedMonths: number) {
    if (selectedMonths === 1) {
        return "past month";
    }

    return `past ${selectedMonths} months`;
}

function WellbeingTrendChart({
    data,
    selectedMonths,
}: WellbeingTrendChartProps) {
    return (
        <article className="dashboard-card">
            <div className="dashboard-card-header">
                <div>
                    <h2>Wellbeing trend</h2>
                    <p>
                        DASS-21 scores over {getPeriodLabel(selectedMonths)}
                    </p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="chart-placeholder">
                    No workload trend data for this period.
                </div>
            ) : (
                <div className="wellbeing-line-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 24,
                                left: 0,
                                bottom: 8,
                            }}
                        >
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="4 4"
                            />

                            <XAxis
                                dataKey="periodStart"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                domain={[0, 42]}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="depression"
                                name="Depression"
                                stroke="#7658b1"
                                strokeWidth={4}
                                dot={{
                                    r: 5,
                                    strokeWidth: 3,
                                    fill: "#ffffff",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="anxiety"
                                name="Anxiety"
                                stroke="#ea5757"
                                strokeWidth={4}
                                dot={{
                                    r: 5,
                                    strokeWidth: 3,
                                    fill: "#ffffff",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="stress"
                                name="Stress"
                                stroke="#f8966c"
                                strokeWidth={4}
                                dot={{
                                    r: 5,
                                    strokeWidth: 3,
                                    fill: "#ffffff",
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </article>
    );
}

export default WellbeingTrendChart;