import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

export const DashboardChart = ({ monthlyBudget }) => {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyBudget}>
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                />

                <Tooltip />

                <Bar
                    dataKey="income"
                    fill="#059669"
                    radius={[8, 8, 0, 0]}
                />

                <Bar
                    dataKey="expenses"
                    fill="#dc2626"
                    radius={[8, 8, 0, 0]}
                />

                <Bar
                    dataKey="additionals"
                    fill="#d61dc7"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
