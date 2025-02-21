"use client";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

export default function USMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const chartRef = useRef();
  const width = 800;
  const height = 500;

  // Projection
  const projection = d3
    .geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  useEffect(() => {
    // ✅ Load the GeoJSON data
    d3.json("/gz_2010_us_040_00_5m.json")
      .then((data) => {
        console.log("GeoJSON Loaded:", data);
        setGeoJsonData(data);
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  useEffect(() => {
    if (!geoJsonData) return; // ✅ Ensure the data is available

    const svg = d3.select(chartRef.current);
    const pathGenerator = d3.geoPath().projection(projection);

    console.log("Projection:", projection);
    console.log("GeoJSON Data:", geoJsonData);

    svg
      .selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", "#ccc")
      .attr("stroke", "#333");

    // ✅ Add State Names at Centroids
    svg
      .selectAll("text")
      .data(geoJsonData.features)
      .enter()
      .append("text")
      .attr("x", (d) => {
        const centroid = d3.geoCentroid(d);
        return projection(centroid) ? projection(centroid)[0] : 0;
      })
      .attr("y", (d) => {
        const centroid = d3.geoCentroid(d);
        return projection(centroid) ? projection(centroid)[1] : 0;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text((d) => d.properties.NAME);
  }, [geoJsonData]); // ✅ Dependency added

  return <svg ref={chartRef} width={width} height={height} />;
}
