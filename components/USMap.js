"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import usStates from "./usStates";

export default function USMap({ geoJsonData }) {
  const chartRef = useRef();
  const router = useRouter();

  useEffect(() => {
    if (!geoJsonData || !geoJsonData.features) {
      console.error("❌ geoJsonData is missing or invalid:", geoJsonData);
      return;
    }

    console.log("✅ geoJsonData Loaded:", geoJsonData);

    const width = 1000,
      height = 700;

    // 🔹 Clear previous render (prevents duplication on re-renders)
    d3.select(chartRef.current).selectAll("*").remove();

    // 🔹 Create SVG and apply a soft background
    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f0f5fa"); // Soft blue-gray background

    // 🔹 Set up the map projection and path generator
    const projection = d3.geoAlbersUsa().fitSize([width, height], geoJsonData);
    if (!projection) {
      console.error("❌ Projection is NULL. Check geoJsonData:", geoJsonData);
      return;
    }

    const pathGenerator = d3.geoPath().projection(projection);

    // 🔹 Define a color scale (gradient from light blue to dark blue)
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, geoJsonData.features.length]);

    // 🔹 Draw US States with dynamic color
    const states = svg
      .append("g")
      .selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", (d, i) => colorScale(i)) // Assign dynamic color
      .attr("stroke", "white") // White stroke for contrast
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "fill 0.3s ease") // Smooth transition effect
      .each(function (d, i) {
        d.originalColor = colorScale(i); // Store the original color for hover effect
      })
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("fill", "#003366"); // Darker blue on hover
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("fill", d.originalColor); // Restore original color when hover ends
      })
      .on("click", (event, d) => {
        const stateName = d.properties.NAME;
        console.log("🖱 Clicked on:", stateName);
        const city = usStates[stateName];
        if (city) {
          console.log(`🔀 Navigating to: /weather/${city}`);
          router.push(`/weather/${city}`);
        } else {
          alert(`⚠ No data available for ${stateName}`);
        }
      });

    // 🔹 Add state labels (Names centered on each state)
    svg
      .selectAll("text")
      .data(geoJsonData.features)
      .enter()
      .append("text")
      .attr("x", (d) => {
        const centroid = d3.geoCentroid(d);
        return centroid && projection(centroid) ? projection(centroid)[0] : 0;
      })
      .attr("y", (d) => {
        const centroid = d3.geoCentroid(d);
        return centroid && projection(centroid) ? projection(centroid)[1] : 0;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#002244") // Dark blue for better contrast
      .style("pointer-events", "none") // Prevent text from blocking hover effect
      .text((d) => d.properties.NAME);

    // 🔹 Define color legend properties
    const legendHeight = 200;
    const legendWidth = 20;
    const legendX = width - 60; // Adjusted position further to the right
    const legendY = height / 3; // Center the legend vertically

    const legendScale = d3
      .scaleLinear()
      .domain([0, geoJsonData.features.length])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale).ticks(6).tickSize(6);

    // 🔹 Move the legend bar to better spacing
    const legend = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`) // Adjusted position
      .call(legendAxis);

    // 🔹 Create a gradient for the legend
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
        { offset: "0%", color: d3.interpolateBlues(0) },
        { offset: "100%", color: d3.interpolateBlues(1) },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // 🔹 Add the legend gradient bar
    svg
      .append("rect")
      .attr("x", legendX - 25) // Move slightly left so it aligns with the axis
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legendGradient)");

    // 🔹 Add label for the legend
    svg
      .append("text")
      .attr("x", legendX - 30) // Move text along with the bar
      .attr("y", legendY - 10)
      .text("State Index")
      .attr("font-size", "14px")
      .attr("fill", "black")
      .attr("font-weight", "bold");
  }, [geoJsonData]);

  return <svg ref={chartRef} />;
}
