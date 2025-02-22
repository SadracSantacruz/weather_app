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

    console.log("✅ geoJsonData Loaded:", geoJsonData); // Debugging

    const width = 800,
      height = 500;

    // Clear previous render
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoAlbersUsa().fitSize([width, height], geoJsonData);

    // ✅ Prevent using a null projection
    if (!projection) {
      console.error("❌ Projection is NULL. Check geoJsonData:", geoJsonData);
      return;
    }

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw states
    svg
      .append("g")
      .selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", "lightgray")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("mouseover", function () {
        d3.select(this).attr("fill", "gray");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "lightgray");
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

    // ✅ Fix state labels positioning
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
      .attr("font-size", "12px")
      .text((d) => d.properties.NAME);
  }, [geoJsonData]);

  return <svg ref={chartRef} />;
}
