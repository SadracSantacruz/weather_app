"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function RainfallCloudHeatmap({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const margin = { top: 50, right: 60, bottom: 80, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Extract relevant data (time, precipitation/cloud coverage)
    const formattedData = data.map((d) => ({
      time: new Date(d.dt * 1000),
      intensity: d.rain ? d.rain["1h"] || 0 : d.clouds.all, // Use rain if available, otherwise cloud coverage
    }));

    // Clear previous render
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.time))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d) => d.intensity)])
      .range([height, 0]);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(formattedData, (d) => d.intensity)]);

    // Create Grid Rectangles
    const gridSize = width / formattedData.length;

    svg
      .selectAll("rect")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.time))
      .attr("y", 0)
      .attr("width", gridSize)
      .attr("height", height)
      .attr("fill", (d) => colorScale(d.intensity))
      .attr("opacity", 0.9)
      .attr("stroke", "#1e3a8a");

    // X-Axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    // Y-Axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#f8fafc")
      .style("font-weight", "bold")
      .text("Rainfall & Cloud Coverage Heatmap");

    // Legend
    const legendWidth = 300;
    const legendHeight = 15;

    const legendSvg = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 - legendWidth / 2},${height + 50})`
      );

    const legendScale = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d) => d.intensity)])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    // Gradient for legend
    const gradient = legendSvg
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
        { offset: "0%", color: d3.interpolateBlues(0) },
        { offset: "100%", color: d3.interpolateBlues(1) },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // Draw the legend bar
    legendSvg
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legendGradient)");

    // Add legend axis labels
    legendSvg
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#f8fafc");

    // Legend Label
    legendSvg
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#f8fafc")
      .style("font-weight", "bold")
      .text("Intensity Scale");
  }, [data]);

  return <svg ref={chartRef} />;
}
