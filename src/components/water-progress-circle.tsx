"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

type WaterProgressCircleProps = {
  current: number;
  goal: number;
};

export function WaterProgressCircle({ current, goal }: WaterProgressCircleProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const data = [{ name: "water", value: percentage }];

  return (
    <div className="relative h-60 w-60 sm:h-64 sm:w-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="85%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={12}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "var(--chart-2)" }}
            dataKey="value"
            cornerRadius={10}
            className="fill-primary"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold tracking-tighter text-primary">
          {Math.round(percentage)}%
        </span>
        <span className="mt-1 font-medium text-muted-foreground">
          {current.toLocaleString()} / {goal.toLocaleString()} ml
        </span>
      </div>
    </div>
  );
}
