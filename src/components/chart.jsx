import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "Jul", totalAmount: 0 },
  { month: "Aug", totalAmount: 0 },
  { month: "Sept", totalAmount: 0 },
  { month: "Oct", totalAmount: 0 },
  { month: "Nov", totalAmount: 0 },
  { month: "Dec", totalAmount: 0 },
  { month: "Jan", totalAmount: 0 },
  { month: "Feb", totalAmount: 0 },
  { month: "Mar", totalAmount: 0 },
  { month: "Apr", totalAmount: 0 },
  { month: "May", totalAmount: 0 },
  { month: "Jan", totalAmount: 0 },
];

export function Chart({ monthlyBookings }) {
  const { t } = useTranslation();
  const chartConfig = {
    totalAmount: {
      label: t("components.monthlyRevenue"),
      color: "#7648B2",
    },
  };
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={monthlyBookings || chartData}>
        <CartesianGrid vertical={false} />
        <YAxis tickLine={true} tickMargin={5} axisLine={true} />
        <XAxis
          dataKey="month"
          tickMargin={5}
          tickLine={true}
          axisLine={true}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" />
      </BarChart>
    </ChartContainer>
  );
}
