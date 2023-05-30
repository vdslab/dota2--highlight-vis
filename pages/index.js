import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { NewAppBar } from "./NewAppBar.js";

export default function Home({ _jsonData, _posData }) {
  useEffect(() => {});
  const width = 400;
  const height = 800;
  const margin = 50;
  const imageSize = 4.5;
  return (
    <div>
      <NewAppBar />
      <ZoomableSVG width={width} height={height}>
        <g>
          <circle x="30" y="40" r="100"></circle>
        </g>
      </ZoomableSVG>
    </div>
  );
}

function ZoomableSVG({ children, width, height }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg ref={svgRef} viewBox="0 0 800 1200" style={{ cursor: "grab" }}>
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}
