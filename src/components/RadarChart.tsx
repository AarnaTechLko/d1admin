"use client";
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type RadarDataPoint = {
  subject: string;
  A: number;
};

export default function RadarChart({ data }: { data: RadarDataPoint[] }) {
  return (
    <div className="w-full h-80 bg-white rounded shadow p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar name="Player" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
