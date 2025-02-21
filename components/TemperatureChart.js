"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TemperatureChart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      console.error(
        "❌ TemperatureChart Error: Expected array but received:",
        data
      );
      return;
    }

    // Format data for D3
    const temperatures = data.map((d) => ({
      date: new Date(d.dt * 1000), // Convert timestamp
      temp: d.main.temp,
    }));

    const width = 500,
      height = 300,
      margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(temperatures, (d) => d.date))
      .range([0, width - margin.left - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(temperatures, (d) => d.temp) - 2,
        d3.max(temperatures, (d) => d.temp) + 2,
      ])
      .range([height - margin.top - margin.bottom, 0]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.temp))
      .curve(d3.curveMonotoneX);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Temperature Trend (Next 5 Days)");

    svg
      .append("path")
      .datum(temperatures)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={chartRef} />;
}
