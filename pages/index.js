import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { NewAppBar } from "./NewAppBar.js";
import Drawer from "@mui/material/Drawer";
import { FormControl, IconButton } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { request } from "./api";
import { Modal, Tooltip } from "@mui/material";
import { Box } from "@mui/system";

export default function Home({
  _nodesData,
  _linksData,
  _keyList,
  _keyValues,
  _leagueNames,
}) {
  const [nodesData, setNodesData] = useState(_nodesData);
  const [linksData, setLinksData] = useState(_linksData);
  const [isShowNodeData, setIsShowNodeData] = useState(false);
  const [clickedNode, setClickedNode] = useState(null);
  const [keysList, setKeysList] = useState(_keyList);
  const [keyValues, setKeyValues] = useState(_keyValues);
  const leagueNames = _leagueNames;
  const DrawerHeader = styled("div")(({ theme }) => ({
    background: "#1976d2",
    display: "left",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));
  const colorScale = d3
    .scaleLinear()
    .domain([0, 10, 21])
    .range(["red", "yellow", "blue"]);
  const theme = useTheme();
  const handleDrawerClose = () => {
    setIsShowNodeData(false);
  };
  useEffect(() => {
    for (let i = 0; i < nodesData.length; i++) {
      let flag = true;
      for (let j = 0; j < keyValues.length; j++) {
        if (
          keyValues[j][0] > nodesData[i]["properties"][keysList[j]] ||
          keyValues[j][1] < nodesData[i]["properties"][keysList[j]]
        ) {
          flag = false;
        }
      }
      setNodesData(
        nodesData.map((node, index) => {
          if (i == index) {
            node["flag"] = flag;
          }
          return node;
        })
      );
    }
    setNodesData(nodesData.filter((v) => v));
  }, [keyValues]);
  const width = 1400;
  const height = 980;
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
      <NewAppBar
        keysList={keysList}
        keyValues={keyValues}
        setKeyValues={setKeyValues}
      />
      <Drawer
        sx={{
          flexShrink: 0,
          "@media screen and (min-width:600px)": {
            width: ".8rem",
          },
        }}
        variant="temporary"
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
        <Subcontent node={clickedNode} />
      </Drawer>
      <ZoomableSVG width={2100} height={height}>
        {linksData.map((data, index) => {
          const node1 = nodesData.find((x) => data.source == x.id);
          const node2 = nodesData.find((x) => data.target == x.id);
          if (node1.flag && node2.flag) {
            if (node1 == clickedNode || node2 == clickedNode) {
              return (
                <g key={index}>
                  <line
                    x1={node1.x}
                    x2={node2.x}
                    y1={node1.y}
                    y2={node2.y}
                    stroke="red"
                    strokeWidth="10"
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
          }
        })}
        {nodesData.map((data, index) => {
          if (data.flag) {
            let leagueIndex = -1;
            for (let i = 0; i < leagueNames.length; i++) {
              if (data.properties.leagueName.includes(leagueNames[i]))
                leagueIndex = i;
            }
            return (
              <g
                key={data.id}
                onClick={() => {
                  setIsShowNodeData(true);
                  setClickedNode(data);
                }}
              >
                <circle
                  fill={colorScale(leagueIndex)}
                  stroke="black"
                  cx={data.x}
                  cy={data.y}
                  r={10}
                ></circle>
              </g>
            );
          }
        })}
      </ZoomableSVG>
      <Box
        sx={{ display: "flex", border: "1px solid" }}
        border={4}
        borderColor="primary.main"
      >
        <svg width={width} height={1200 - height}>
          {leagueNames.map((league, index) => {
            return (
              <g
                key={league}
                transform={`translate(${parseInt(index / 7) * 320},${
                  ((index % 7) + 1) * 20
                })`}
              >
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  fill={colorScale(index)}
                ></rect>
                <text
                  alignmentBaseline="middle"
                  textAnchor="MiddleLeft"
                  x="20"
                  y="10"
                >
                  {league}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const newData = JSON.parse(fs.readFileSync("./public/out.json"));
  const _nodesData = [];
  const _linksData = [];
  let _leagueNames = [];
  let _keyList = null;
  newData.map((d) => {
    if (d.type == "node") {
      if (!_keyList) {
        _keyList = Object.keys(d.properties);
        _keyList.splice(_keyList.indexOf("x"), 1);
        _keyList.splice(_keyList.indexOf("y"), 1);
        _keyList.splice(_keyList.indexOf("matchId"), 1);
        _keyList.splice(_keyList.indexOf("analysisOutcome"), 1);
        _keyList.splice(_keyList.indexOf("leagueName"), 1);
        _keyList.splice(_keyList.indexOf("loseTeamName"), 1);
        _keyList.splice(_keyList.indexOf("winTeamName"), 1);
      }
      if (!_leagueNames.includes(d.properties.leagueName.replace("?", "-"))) {
        _leagueNames[_leagueNames.length] = d.properties.leagueName.replace(
          "?",
          "-"
        );
      }

      _nodesData[_nodesData.length] = {
        id: d.id,
        matchId: d.properties.matchId,
        x: d.properties.x * 300,
        y: d.properties.y * 300,
        properties: d.properties,
        flag: true,
      };
    } else if (d.type == "relationship") {
      _linksData[_linksData.length] = {
        id: d.id,
        source: d.start.id,
        target: d.end.id,
      };
    }
  });
  let _keyValues = new Array(_keyList.length);
  for (let i = 0; i < _keyValues.length; i++) {
    _keyValues[i] = 0;
  }
  for (let i = 0; i < _keyList.length; i++) {
    _keyValues[i] = [
      Math.min(..._nodesData.map((n) => n["properties"][_keyList[i]])),
      Math.max(..._nodesData.map((n) => n["properties"][_keyList[i]])),
    ];
  }
  for (let i = 0; i < _leagueNames.length; i++) {
    if (_leagueNames[i].indexOf("I") > 0)
      _leagueNames[i] = _leagueNames[i].substr(0, _leagueNames[i].indexOf("I"));
  }
  _leagueNames = [...new Set(_leagueNames)];
  return {
    props: { _nodesData, _linksData, _keyList, _keyValues, _leagueNames },
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
    <svg ref={svgRef} width={width} height={height} style={{ cursor: "grab" }}>
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}

function Subcontent({ node }) {
  const id = node.properties.matchId;
  const [subData, setSubData] = useState(new Array(2));
  const [keysList, setKeysList] = useState();
  const [playersList, setPlayersList] = useState();
  const [winRate, setWinRate] = useState();
  const x = 0;
  useEffect(() => {
    (async () => {
      const rawDataArray = await request(id);
      if ("errors" in rawDataArray) {
        console.log("error");
      } else {
        const dataArray = rawDataArray.data.match.players;
        const keyList = Object.keys(dataArray[0]["stats"]);
        let players = new Array(10);
        let rawSubData = new Array(keyList.length);
        for (let i = 0; i < rawSubData.length; i++) {
          rawSubData[i] = new Array(10);
        }
        for (let i = 0; i < keyList.length; i++) {
          for (let j = 0; j < dataArray.length; j++) {
            players[j] = dataArray[j]["hero"]["name"].substr(14);
            rawSubData[i][j] = dataArray[j]["stats"][keyList[i]];
          }
        }
        setSubData(rawSubData);
        setKeysList(keyList);
        setPlayersList(players);
        setWinRate(rawDataArray.data.match.winRates);
      }
    })();
  }, [id]);
  console.log(winRate);
  if (subData) {
    return (
      <div>
        <h1 style={{ textAlign: "center" }}>
          {node.properties.leagueName.replace("?", "-")}
        </h1>
        <h1 style={{ textAlign: "center" }}>
          {node.properties.winTeamName} VS {node.properties.loseTeamName}
        </h1>
        <LineGraph text={"winrate"} key={"winrate"} data={winRate}></LineGraph>
        {subData.map((data, index) => {
          return (
            <LineGraphForPlayers
              text={keysList[index]}
              key={index}
              data={data}
              playersList={playersList}
            />
          );
        })}
      </div>
    );
  }
}

function LineGraphForPlayers({ text, data, playersList }) {
  const contentW = 800,
    contentH = 400;
  const margin = { top: 50, bottom: 100, left: 350, right: 100 };
  const windowW = contentW + margin.left + margin.right;
  const windowH = contentH + margin.top + margin.bottom;
  const dataCol = d3.schemeCategory10;
  const lineCol = "black";
  const lineStroke = 3;
  const [hoverIndex, setHoverIndex] = useState(null);

  const xScale = d3
    .scaleLinear()
    .domain([0, data[0].length - 1])
    .range([0, contentW])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data.reduce((a, b) => a.concat(b))))
    .range([contentH, 0])
    .nice();

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
            {data.map((d, index) => {
              return (
                <Tooltip
                  title={playersList[index]}
                  key={index}
                  arrow
                  followCursor
                >
                  <path
                    d={line(d)}
                    key={index}
                    fill="none"
                    stroke={dataCol[index]}
                    strokeWidth={lineStroke + (hoverIndex === index) * 4}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                </Tooltip>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

function LineGraph({ text, data }) {
  const contentW = 800,
    contentH = 400;
  const margin = { top: 50, bottom: 100, left: 350, right: 100 };
  const windowW = contentW + margin.left + margin.right;
  const windowH = contentH + margin.top + margin.bottom;
  const lineCol = "black";
  if (data) {
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, contentW])
      .nice();
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data))
      .range([contentH, 0])
      .nice();

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
                    <text
                      x="0"
                      y="18"
                      textAnchor="middle"
                      dominantBaseline="top"
                    >
                      {item}
                    </text>
                  </g>
                );
              })}
            </g>
            <g>
              <path
                d={line(data)}
                key={text}
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
            </g>
          </g>
        </svg>
      </div>
    );
  }
}
