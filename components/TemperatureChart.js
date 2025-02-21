"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TemperatureChart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    const temperatures = data.map((d) => ({
      date: new Date(d.dt * 1000),
      temp: d.main.temp,
    }));

    const width = 1000, // Increased width
      height = 600, // Increased height
      margin = { top: 80, right: 80, bottom: 90, left: 90 }; // More space for labels

    // Clear previous chart before rendering
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
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

    // X and Y Axes
    chart
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%H:%M"))) // ✅ 24-Hour Format
      .selectAll("text")
      .style("font-size", "14px");

    chart
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px");

    // Axis Labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "#333")
      .text("Time (24-Hour Format)"); // ✅ Updated Label

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "#333")
      .text("Temperature (°C)");

    // Chart Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Temperature Trend Over Time");

    // Line Generator
    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.temp))
      .curve(d3.curveMonotoneX);

    const path = chart
      .append("path")
      .datum(temperatures)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3) // Thicker line
      .attr("d", line);

    // Line Animation
    path
      .attr("stroke-dasharray", path.node().getTotalLength())
      .attr("stroke-dashoffset", path.node().getTotalLength())
      .transition()
      .duration(2500)
      .attr("stroke-dashoffset", 0);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "16px")
      .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.3)")
      .style("display", "none");

    // Dots with Tooltip
    chart
      .selectAll("circle")
      .data(temperatures)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.temp))
      .attr("r", 7) // Bigger dots
      .attr("fill", "red")
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `Time: ${d.date.getHours()}:${d.date
              .getMinutes()
              .toString()
              .padStart(2, "0")}<br>Temp: ${d.temp}°C`
          ) // ✅ 24-Hour Format in Tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 25}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }, [data]);

  return <svg ref={chartRef} />;
}
