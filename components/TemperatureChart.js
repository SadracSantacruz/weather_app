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
      margin = { top: 80, right: 80, bottom: 90, left: 90 };

    // Clear previous chart before rendering
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
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

    // 📏 X and Y Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%H:%M"))) // ✅ 24-Hour Format
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    // 📌 Axis Labels
    svg
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#f8fafc")
      .text("Time (24-Hour Format)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 + margin.top)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#f8fafc")
      .text("Temperature (°C)");

    // 🌡️ Chart Title
    svg
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#f8fafc")
      .text("Temperature Trend Over Time");

    // 🌡️ Line Generator
    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.temp))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(temperatures)
      .attr("fill", "none")
      .attr("stroke", "#60a5fa") // Bright blue for contrast
      .attr("stroke-width", 3) // Thicker line
      .attr("d", line);

    // ✨ Line Animation
    path
      .attr("stroke-dasharray", path.node().getTotalLength())
      .attr("stroke-dashoffset", path.node().getTotalLength())
      .transition()
      .duration(2500)
      .attr("stroke-dashoffset", 0);

    // 📌 Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#1e3a8a")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "5px")
      .style("font-size", "14px")
      .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.3)")
      .style("display", "none");

    // 🔴 Dots with Tooltip
    svg
      .selectAll("circle")
      .data(temperatures)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.temp))
      .attr("r", 6) // Bigger dots
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

    // 📏 Add legend (color scale)
    const legendScale = d3
      .scaleLinear()
      .domain([
        d3.min(temperatures, (d) => d.temp),
        d3.max(temperatures, (d) => d.temp),
      ])
      .range([0, 250]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 280}, ${height - 40})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#f8fafc");

    // 🔥 Color Gradient Legend
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legendGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#1e40af" },
        { offset: "50%", color: "#3b82f6" },
        { offset: "100%", color: "#60a5fa" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // 🔥 Legend Box
    svg
      .append("rect")
      .attr("x", width - 280)
      .attr("y", height - 50)
      .attr("width", 250)
      .attr("height", 12)
      .style("fill", "url(#legendGradient)");

    // Legend Label
    svg
      .append("text")
      .attr("x", width - 280)
      .attr("y", height - 60)
      .text("Temperature (°C)")
      .style("font-size", "14px")
      .style("fill", "#f8fafc")
      .style("font-weight", "bold");
  }, [data]);

  return <svg ref={chartRef} />;
}
