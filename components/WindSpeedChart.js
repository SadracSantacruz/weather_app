"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function WindSpeedChart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Extract wind data properly
    const windData = data.map((d) => ({
      date: new Date(d.dt * 1000), // Convert UNIX timestamp to JS Date
      speed: d.wind.speed, // Wind speed in m/s
      direction: d.wind.deg, // Wind direction in degrees
    }));

    const width = 1000,
      height = 600,
      margin = { top: 80, right: 120, bottom: 90, left: 90 };

    // Clear previous render
    d3.select(chartRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale (Time)
    const x = d3
      .scaleTime()
      .domain(d3.extent(windData, (d) => d.date))
      .range([0, width - margin.left - margin.right]);

    // Y Scale (Wind Speed)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(windData, (d) => d.speed) + 2])
      .range([height - margin.top - margin.bottom, 0]);

    // Define Color Scale for Wind Speed
    const colorScale = d3
      .scaleSequential(d3.interpolateTurbo) // Blue → Green → Yellow → Red
      .domain([0, d3.max(windData, (d) => d.speed)]);

    // 🌬️ Title
    svg
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#f8fafc")
      .text("Wind Speed & Direction Over Time");

    // 📏 Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    // 📌 Define arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 L 3 5 Z")
      .attr("fill", "red");

    // Scale factor for arrow length
    const scaleFactor = 8;

    // Add arrows based on wind direction & speed
    const arrows = svg
      .selectAll("line")
      .data(windData)
      .enter()
      .append("line")
      .attr("x1", (d) => x(d.date))
      .attr("y1", (d) => y(d.speed))
      .attr(
        "x2",
        (d) =>
          x(d.date) +
          scaleFactor * d.speed * Math.sin((d.direction * Math.PI) / 180)
      )
      .attr(
        "y2",
        (d) =>
          y(d.speed) -
          scaleFactor * d.speed * Math.cos((d.direction * Math.PI) / 180)
      )
      .attr("stroke", (d) => colorScale(d.speed)) // Apply color based on wind speed
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // 🌬️ Animate arrows (pulsing movement to simulate wind)
    function animateArrows() {
      arrows
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .attr(
          "x2",
          (d) =>
            x(d.date) +
            (scaleFactor * d.speed + 3) *
              Math.sin((d.direction * Math.PI) / 180)
        )
        .attr(
          "y2",
          (d) =>
            y(d.speed) -
            (scaleFactor * d.speed + 3) *
              Math.cos((d.direction * Math.PI) / 180)
        )
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .attr(
          "x2",
          (d) =>
            x(d.date) +
            (scaleFactor * d.speed - 3) *
              Math.sin((d.direction * Math.PI) / 180)
        )
        .attr(
          "y2",
          (d) =>
            y(d.speed) -
            (scaleFactor * d.speed - 3) *
              Math.cos((d.direction * Math.PI) / 180)
        )
        .on("end", animateArrows);
    }

    animateArrows();

    // 📏 Add legend (color scale + arrow length)
    const legendScale = d3
      .scaleLinear()
      .domain([0, d3.max(windData, (d) => d.speed)])
      .range([height - 100, 50]);

    const legendAxis = d3.axisRight(legendScale).ticks(5);

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right - 20}, 0)`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#f8fafc");

    // Color gradient legend
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legendGradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: d3.interpolateTurbo(0) },
        { offset: "100%", color: d3.interpolateTurbo(1) },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // Draw the legend bar
    svg
      .append("rect")
      .attr("x", width - margin.right - 40)
      .attr("y", 50)
      .attr("width", 20)
      .attr("height", height - 150)
      .style("fill", "url(#legendGradient)");

    // Legend Label
    svg
      .append("text")
      .attr("x", width - margin.right - 60)
      .attr("y", 40)
      .text("Wind Speed (m/s)")
      .style("font-size", "14px")
      .style("fill", "#f8fafc")
      .style("font-weight", "bold");
  }, [data]);

  return <svg ref={chartRef} />;
}
