"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function StockChart({ data }: { data: { name: string; pieces: number }[] }) {
  if (!data.length) return <p className="text-sm text-gray-400">Aucune donnée.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis dataKey="name" fontSize={11} interval={0} angle={-30} textAnchor="end" height={60} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="pieces" fill="#714B67" radius={[6, 6, 0, 0]} name="Pièces" />
      </BarChart>
    </ResponsiveContainer>
  );
}
