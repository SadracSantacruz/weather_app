"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function WindSpeedChart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const windSpeeds = data.map((d) => ({
      date: new Date(d.dt * 1000),
      speed: d.wind.speed,
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
      .domain(d3.extent(windSpeeds, (d) => d.date))
      .range([0, width - margin.left - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(windSpeeds, (d) => d.speed) + 2])
      .range([height - margin.top - margin.bottom, 0]);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Wind Speed Variations");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll("circle")
      .data(windSpeeds)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.speed))
      .attr("r", 4)
      .attr("fill", "red");
  }, [data]);

  return <svg ref={chartRef} />;
}
