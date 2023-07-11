import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { NewAppBar } from "./NewAppBar.js";
import Drawer from "@mui/material/Drawer";
import { FormControl, IconButton } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function Home({ _nodesData, _linksData }) {
  const nodesCount = 10;
  const [nodesData, setNodesData] = useState(_nodesData);
  const [linksData, setLinksData] = useState(_linksData);
  const [isShowNodeData, setIsShowNodeData] = useState(false);
  const [clickedId, setClickedId] = useState(null);
  const [history, setHistory] = useState([]);
  for (let i = 0; i < nodesData; i++) {
    s = nodesData[i].properties.id;
    t1 = nodesData[i].properties.connect1;
    t2 = nodesData[i].properties.connect2;
  }
  let x = 0;

  const DrawerHeader = styled("div")(({ theme }) => ({
    background: "#1976d2",
    display: "left",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));
  const theme = useTheme();

  const handleDrawerClose = () => {
    setIsShowNodeData(false);
  };
  useEffect(() => {
    x++;
  }, [clickedId]);
  const width = 1400;
  const height = 1200;
  const margin = 50;

  function xyScale() {
    const xScale = d3
      .scaleLinear()
      .domain([
        Math.min(...nodesData.map((data) => data.x)),
        Math.max(...nodesData.map((data) => data.x)),
      ])
      .range([margin, width - margin])
      .nice();
    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(...nodesData.map((data) => data.y)),
        Math.max(...nodesData.map((data) => data.y)),
      ])
      .range([margin, height - margin])
      .nice();
    return { xScale, yScale };
  }

  const { xScale, yScale } = xyScale();
  return (
    <div>
      <NewAppBar history={history} />
      <Drawer
        sx={{
          width: isShowNodeData,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isShowNodeData * width,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="right"
        open={isShowNodeData}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Subcontent id={clickedId} />
      </Drawer>
      <ZoomableSVG width={width} height={height}>
        {linksData.map((data, index) => {
          const node1 = nodesData.find((x) => data.source == x.id);
          const node2 = nodesData.find((x) => data.target == x.id);
          if (node1.id == clickedId || node2.id == clickedId) {
            return (
              <g key={index}>
                <line
                  x1={node1.x}
                  x2={node2.x}
                  y1={node1.y}
                  y2={node2.y}
                  stroke="red"
                  stroke-width="4"
                ></line>
              </g>
            );
          } else {
            return (
              <g key={index}>
                <line
                  x1={node1.x}
                  x2={node2.x}
                  y1={node1.y}
                  y2={node2.y}
                  stroke="black"
                ></line>
              </g>
            );
          }
        })}
        {nodesData.map((data, index) => {
          return (
            <g
              key={data.id}
              onClick={() => {
                setIsShowNodeData(true);
                setClickedId(data.id);
                setHistory([...history, data.id]);
              }}
            >
              <circle
                fill="none"
                stroke="black"
                cx={data.x}
                cy={data.y}
                r={30}
              ></circle>
              <text
                textAnchor="middle"
                stroke="black"
                fill="Red"
                fontSize={"10px"}
                x={data.x}
                y={data.y}
              >
                {data.id}
              </text>
            </g>
          );
        })}
      </ZoomableSVG>
    </div>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const newData = JSON.parse(fs.readFileSync("./public/out2.json"));
  const _nodesData = [];
  const _linksData = [];
  newData.map((d) => {
    if (d.type == "node") {
      _nodesData[_nodesData.length] = {
        id: d.id,
        x: d.properties.x * 300,
        y: d.properties.y * 300,
      };
    } else if (d.type == "relationship") {
      _linksData[_linksData.length] = {
        id: d.id,
        source: d.start.id,
        target: d.end.id,
      };
    }
  });
  return {
    props: { _nodesData, _linksData },
  };
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

function Subcontent({ id }) {
  const subCharts = ["winrate", "gold", "LVL"];

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>{id}</h1>
      {subCharts.map((t) => {
        return <LineGraph text={t} key={t} />;
      })}
    </div>
  );
}

function LineGraph({ text }) {
  const winRates = [
    0.3, 0.31, 0.29, 0.27, 0.33, 0.34, 0.35, 0.31, 0.25, 0.33, 0.35, 0.44, 0.46,
    0.45, 0.33, 0.32, 0.21, 0.3, 0.47, 0.32, 0.4, 0.63, 0.57, 0.64, 0.7, 0.83,
  ];

  const contentW = 800,
    contentH = 400;
  const margin = { top: 50, bottom: 100, left: 350, right: 100 };
  const windowW = contentW + margin.left + margin.right;
  const windowH = contentH + margin.top + margin.bottom;
  const lineCol = "black";
  const dataCol = "red";

  const xScale = d3
    .scaleLinear()
    .domain([0, winRates.length - 1])
    .range([0, contentW]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(winRates))
    .range([contentH, 0]);

  const line = d3
    .line()
    .x((d, i) => xScale(i))
    .y((d) => yScale(d));
  return (
    <div>
      <svg width={windowW} height={windowH}>
        <text x={windowW / 2} y="30" stroke="lineCol" fontSize="20">
          {text}
        </text>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <g>
            <line x1="0" y1="0" x2="0" y2={contentH} stroke={lineCol}></line>
            <text></text>
            {yScale.ticks().map((item, index) => {
              return (
                <g key={index} transform={`translate(0, ${yScale(item)})`}>
                  <line
                    x1="-3"
                    y1="0"
                    x2={contentW}
                    y2="0"
                    stroke={lineCol}
                    strokeOpacity="40%"
                  />
                  <text
                    x="-10"
                    y="0"
                    textAnchor="end"
                    dominantBaseline="central"
                  >
                    {item}
                  </text>
                </g>
              );
            })}
          </g>

          <g transform={`translate(0, ${contentH})`}>
            <line x1="0" y1="0" x2={contentW} y2="0" stroke={lineCol}></line>
            {xScale.ticks().map((item, index) => {
              return (
                <g key={index} transform={`translate(${xScale(item)}, 0)`}>
                  <line x1="0" y1="0" x2="0" y2="3" stroke={lineCol} />
                  <text x="0" y="18" textAnchor="middle" dominantBaseline="top">
                    {item}
                  </text>
                </g>
              );
            })}
          </g>
          <g>
            <path
              d={line(winRates)}
              fill="none"
              stroke={dataCol}
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
