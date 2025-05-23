"use client"

import * as React from "react"
import {
  BarChart as BarChartPrimitive,
  LineChart as LineChartPrimitive,
  PieChart as PieChartPrimitive,
  type BarChartProps as BarChartPrimitiveProps,
  type LineChartProps as LineChartPrimitiveProps,
  type PieChartProps as PieChartPrimitiveProps,
} from "recharts"

export type BarChartData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
}

export type LineChartData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    fill?: boolean
  }[]
}

export type PieChartData = {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
  }[]
}

export function BarChart({ data, ...props }: { data: BarChartData } & Omit<BarChartPrimitiveProps, "data">) {
  const chartData = data.labels.map((label, index) => {
    const entry: { [key: string]: string | number } = { name: label }
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index]
    })
    return entry
  })

  return (
    <BarChartPrimitive data={chartData} {...props}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {data.datasets.map((dataset, index) => (
        <Bar key={index} dataKey={dataset.label} fill={dataset.backgroundColor} />
      ))}
    </BarChartPrimitive>
  )
}

export function LineChart({ data, ...props }: { data: LineChartData } & Omit<LineChartPrimitiveProps, "data">) {
  const chartData = data.labels.map((label, index) => {
    const entry: { [key: string]: string | number } = { name: label }
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index]
    })
    return entry
  })

  return (
    <LineChartPrimitive data={chartData} {...props}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {data.datasets.map((dataset, index) => (
        <Line
          key={index}
          type="monotone"
          dataKey={dataset.label}
          stroke={dataset.borderColor}
          fill={dataset.fill ? dataset.borderColor : undefined}
        />
      ))}
    </LineChartPrimitive>
  )
}

export function PieChart({ data, ...props }: { data: PieChartData } & Omit<PieChartPrimitiveProps, "data">) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }))

  return (
    <PieChartPrimitive {...props}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={data.datasets[0].backgroundColor[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChartPrimitive>
  )
}

// Re-export Recharts components you might need
export {
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"