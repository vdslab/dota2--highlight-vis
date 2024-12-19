import * as d3 from "d3";
import { useEffect, useState } from "react";
import { matchRequest } from "./api";
import {
  NextUIProvider,
  Button,
  Text,
  Input,
  Grid,
  Card,
  Spacer,
  Link,
  Dropdown,
} from "@nextui-org/react";

const translate = [
  "試合時間",
  "初キル時間",
  "最大マルチキル数",
  "最大キルストリーク数",
  "勝率平均",
  "バイバック回数",
  "勝チームキル数",
  "負チームキル数",
];
const attributesStep = [100, 100, 1, 1, 1, 1, 1, 1];
const attributes = [
  "durationSeconds",
  "firstBloodTime",
  "maxMultKillsCount",
  "maxKillStreakCount",
  "winRates",
  "buyBackCount",
  "winTeamKills",
  "loseTeamKills",
];
const multiKill = [
  "KILL",
  "DOUBLE KILL",
  "TRIPLE KILL",
  "ULTRA KILL",
  "RAMPAGE",
  "DOUBLE RAMPAGE",
  "TRIPLE RAMPAGE",
];
const green = "#28a745";
const blue = "#007bff";
const pink = "#ff69b4";
const yellow = "#f3bf49";

export default function Home({
  _nodesData,
  _linksData,
  _keyValues,
  _teamNamesArray,
}) {
  const [nodesData, setNodesData] = useState(_nodesData);
  const [linksData, setLinksData] = useState(_linksData);
  const [attributesValue, setAttributesValue] = useState(_keyValues);
  const [currentMenu, setCurrentMenu] = useState(0);
  const [clickedNode, setClickedNode] = useState(null);
  const [clickedAtr, setClickedAtr] = useState(-1);
  const [matchData, setMatchData] = useState(null);
  const [toolTip, setToolTip] = useState(null);
  const [searchTeam, setSearchTeam] = useState("");
  const [timer, setTimer] = useState(null);
  const [skipAtr, setSkipAtr] = useState({ skip: true, skipMode: true });
  const [outcomeFilter, setOutcomeFilter] = useState({
    NONE: true,
    COMEBACK: true,
    STOMPED: true,
    CLOSE_GAME: true,
  });

  useEffect(() => {
    /*
    setAttributesValue(
      attributesValue.map((e, i) => {
        return i == 0 ? [2600, e[1]] : i == 2 ? [4, e[1]] : e;
      })
    );*/
    setSearchTeam(_teamNamesArray[0]);

    const intervalId = setInterval(() => {
      setSkipAtr({ skip: true, skipMode: true });
    }, 2000);
    setTimer(intervalId);
  }, []);

  useEffect(() => {
    if (!skipAtr.skipMode) {
      //console.log("削除");
      clearInterval(timer);
      setTimer(null);
    }
    if (skipAtr.skip) {
      setClickedAtr((clickedAtr + 1) % 8);
      setSkipAtr({ skip: false, skipMode: true });
    }
  }, [skipAtr]);

  useEffect(() => {
    //console.time("nodesData");
    setNodesData(
      _nodesData.filter((e) => {
        return (
          attributesValue.every((f, i) =>
            f[0] <= f[1]
              ? f[0] <= e.properties[attributes[i]] &&
                e.properties[attributes[i]] <= f[1]
              : false
          ) &&
          outcomeFilter[e.properties.analysisOutcome] &&
          (searchTeam?.currentKey == "チーム名で検索"
            ? true
            : e.properties.winTeamName == searchTeam?.currentKey ||
              e.properties.loseTeamName == searchTeam?.currentKey)
        );
      })
    );
    //console.timeEnd('nodesData');
  }, [attributesValue, outcomeFilter, searchTeam]);

  useEffect(() => {
    //console.time('linksData');
    const ids = nodesData.map((e) => e.id);
    if (ids.length != 0) {
      setLinksData(
        _linksData.filter((e) => {
          return ids.includes(e.source.id) && ids.includes(e.target.id);
        })
      );
    } else {
      setLinksData([]);
    }
    //console.timeEnd('linksData');
  }, [nodesData]);

  useEffect(() => {
    if (clickedNode != null) {
      setCurrentMenu(1);
      matchRequest(clickedNode.properties.matchId).then((r) => setMatchData(r));
    } else {
      setMatchData(null);
    }
  }, [clickedNode]);

  return (
    <NextUIProvider>
      <Text h1 style={{ textAlign: "center" }}>
        Dota2 Highlight Visualization
      </Text>
      <Grid.Container gap={2}>
        <Grid xs={"auto"} sm={4} direction="column" alignItems="center">
          <Grid.Container gap={1}>
            <MenuButton
              currentMenu={currentMenu}
              setCurrentMenu={setCurrentMenu}
            />
          </Grid.Container>
          <Grid.Container gap={2} wrap="wrap">
            <Grid xs={12} direction="column" alignItems="stretch">
              {currentMenu == 0 && (
                <>
                  <Button
                    color="warning"
                    onPress={() => {
                      setAttributesValue(_keyValues);
                      setClickedAtr(null);
                    }}
                  >
                    入力リセット
                  </Button>
                  {attributes.map((e, i) => {
                    return (
                      <Attributes
                        key={i}
                        index={i}
                        attributesValue={attributesValue}
                        setAttributesValue={setAttributesValue}
                        clickedAtr={clickedAtr}
                        setClickedAtr={setClickedAtr}
                        setSkipAtr={setSkipAtr}
                        timer={timer}
                      />
                    );
                  })}

                  <TeamFilter
                    searchTeam={searchTeam}
                    setSearchTeam={setSearchTeam}
                    teamNamesArray={_teamNamesArray}
                  />
                </>
              )}
              {currentMenu == 1 && (
                <Detail
                  attributes={attributes}
                  clickedNode={clickedNode}
                  setClickedNode={setClickedNode}
                  matchData={matchData}
                />
              )}
            </Grid>
          </Grid.Container>
        </Grid>
        <Grid xs={"auto"} direction="column" alignItems="center">
          <NetworkChart
            nodesData={nodesData}
            linksData={linksData}
            clickedNode={clickedNode}
            setClickedNode={setClickedNode}
            clickedAtr={clickedAtr != null ? attributes[clickedAtr] : null}
            outcomeFilter={outcomeFilter}
            setOutcomeFilter={setOutcomeFilter}
          />
          <Spacer y={2} />
          <LineChart
            matchData={matchData}
            loading={clickedNode != null}
            toolTip={toolTip}
            setToolTip={setToolTip}
          />
        </Grid>
      </Grid.Container>
    </NextUIProvider>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const newData = JSON.parse(fs.readFileSync("./public/out.json"));
  const _nodesData = [];
  const _linksData = [];
  newData.map((d, index) => {
    if (d.type == "node") {
      d.properties.winRates = d.properties.winRates * 100;
      _nodesData[_nodesData.length] = {
        id: d.id,
        x: d.properties.x,
        y: d.properties.y,
        properties: d.properties,
      };
    } else if (d.type == "relationship") {
      _linksData[_linksData.length] = {
        id: d.id,
        source: {
          id: d.start.id,
          x: d.start.properties.x,
          y: d.start.properties.y,
        },
        target: { id: d.end.id, x: d.end.properties.x, y: d.end.properties.y },
      };
    }
  });
  const _keyValues = attributes.map((e) => {
    return d3
      .extent(_nodesData.map((f) => f["properties"][e]))
      .map((f, i) => (i == 0 ? Math.floor(f) : Math.ceil(f)));
  });
  const _teamNamesArray = [
    ...new Set(
      _nodesData.flatMap((item) => [
        item.properties.loseTeamName,
        item.properties.winTeamName,
      ])
    ),
  ].map((e) => {
    return { key: e, value: e };
  });
  _teamNamesArray.splice(0, 0, {
    key: "チーム名で検索",
    value: "デフォルト",
    currentKey: "チーム名で検索",
  });

  return {
    props: { _nodesData, _linksData, _keyValues, _teamNamesArray },
  };
}

function MenuButton({ currentMenu, setCurrentMenu }) {
  const menu = ["フィルター", "詳細"];
  return menu.map((e, i) => {
    return (
      <Grid key={i} xs={6} direction="column" alignItems="stretch">
        <Button
          size={"xs"}
          color={i == currentMenu ? "primary" : ""}
          iconRight={<MyIcon type={e} fill="currentColor" filled />}
          onPress={(e) => {
            setCurrentMenu(i);
          }}
        >
          {e}
        </Button>
      </Grid>
    );
  });
}

function MyIcon({ type, fill, filled }) {
  const Icon = () => {
    switch (type) {
      case "詳細":
        return (
          <path
            stroke={fill}
            d="M7.3304 2.0004H16.6694C20.0704 2.0004 21.9904 3.9294 22.0004 7.3304V16.6704C22.0004 20.0704 20.0704 22.0004 16.6694 22.0004H7.3304C3.9294 22.0004 2.0004 20.0704 2.0004 16.6704V7.3304C2.0004 3.9294 3.9294 2.0004 7.3304 2.0004ZM12.0494 17.8604C12.4804 17.8604 12.8394 17.5404 12.8794 17.1104V6.9204C12.9194 6.6104 12.7704 6.2994 12.5004 6.1304C12.2194 5.9604 11.8794 5.9604 11.6104 6.1304C11.3394 6.2994 11.1904 6.6104 11.2194 6.9204V17.1104C11.2704 17.5404 11.6294 17.8604 12.0494 17.8604ZM16.6504 17.8604C17.0704 17.8604 17.4294 17.5404 17.4804 17.1104V13.8304C17.5094 13.5094 17.3604 13.2104 17.0894 13.0404C16.8204 12.8704 16.4804 12.8704 16.2004 13.0404C15.9294 13.2104 15.7804 13.5094 15.8204 13.8304V17.1104C15.8604 17.5404 16.2194 17.8604 16.6504 17.8604ZM8.2194 17.1104C8.1794 17.5404 7.8204 17.8604 7.3894 17.8604C6.9594 17.8604 6.5994 17.5404 6.5604 17.1104V10.2004C6.5304 9.8894 6.6794 9.5804 6.9504 9.4104C7.2194 9.2404 7.5604 9.2404 7.8304 9.4104C8.0994 9.5804 8.2504 9.8894 8.2194 10.2004V17.1104Z"
          />
        );
      case "フィルター":
        return (
          <path
            stroke={fill}
            d="M4.12819 2H19.8718C21.0476 2 22 2.98105 22 4.19225V5.72376C22 6.31133 21.7704 6.87557 21.3627 7.28708L14.8577 13.867C14.7454 13.9816 14.5931 14.0452 14.4355 14.0441L8.98893 14.0272C8.82317 14.0272 8.66564 13.9561 8.55238 13.832L2.57452 7.25738C2.20489 6.85117 2 6.31451 2 5.7577V4.19332C2 2.98211 2.95238 2 4.12819 2ZM9.2801 15.8241L14.1347 15.839C14.4374 15.8401 14.6824 16.0935 14.6824 16.4043V19.1353C14.6824 19.4471 14.5053 19.7293 14.2294 19.8597L9.8227 21.9289C9.71974 21.9767 9.61061 22 9.50147 22C9.35629 22 9.21112 21.9576 9.08448 21.8738C8.86311 21.7274 8.72927 21.475 8.72927 21.2046V16.3894C8.72927 16.0766 8.97637 15.8231 9.2801 15.8241Z"
          />
        );
    }
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 18 24"
      fill={filled ? fill : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Icon />
    </svg>
  );
}

function Attributes({
  attributesValue,
  setAttributesValue,
  clickedAtr,
  setClickedAtr,
  index,
  setSkipAtr,
  timer,
}) {
  const clicked = clickedAtr == index;
  return (
    <div>
      <Grid.Container gap={1}>
        <Grid xs={4} direction="row" alignItems="center">
          <Text
            h6
            color={clicked ? "primary" : ""}
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (timer != null) setSkipAtr({ skip: false, skipMode: false });
              setClickedAtr(clicked ? null : index);
            }}
          >
            {translate[index]}
          </Text>
        </Grid>
        <Grid xs={4} direction="column" alignItems="center">
          <Input
            label="最小値"
            type="number"
            value={attributesValue[index][0]}
            step={attributesStep[index]}
            onChange={(e) => {
              setAttributesValue(
                attributesValue.map((f, i) => {
                  return i == index ? [e.target.value, f[1]] : f;
                })
              );
            }}
          ></Input>
        </Grid>
        <Grid xs={4} direction="column" alignItems="center">
          <Input
            label="最大値"
            type="number"
            value={attributesValue[index][1]}
            step={attributesStep[index]}
            onChange={(e) => {
              setAttributesValue(
                attributesValue.map((f, i) => {
                  return i == index ? [f[0], e.target.value] : f;
                })
              );
            }}
          ></Input>
        </Grid>
      </Grid.Container>
    </div>
  );
}
function TeamFilter({ searchTeam, setSearchTeam, teamNamesArray }) {
  //console.log(teamNamesArray);
  return (
    <Dropdown>
      <Dropdown.Button flat>{searchTeam?.currentKey}</Dropdown.Button>
      <Dropdown.Menu
        aria-label="Single selection actions"
        color="secondary"
        disallowEmptySelection
        selectionMode="single"
        items={teamNamesArray}
        selectedKeys={searchTeam?.value}
        onSelectionChange={setSearchTeam}
      >
        {(item) => {
          //console.log(item);
          return <Dropdown.Item key={item.key}>{item.value}</Dropdown.Item>;
        }}
      </Dropdown.Menu>
    </Dropdown>
  );
}

function Detail({ attributes, clickedNode, setClickedNode, matchData }) {
  //console.log(clickedNode);
  const data = matchData?.data?.match;
  const findText = data
    ? `${data.radiantTeam.name} VS ${data.direTeam.name} ${data.league.displayName} Game${data.game}`
    : "";
  return (
    <>
      <Button
        color="warning"
        onPress={() => {
          setClickedNode(null);
        }}
      >
        選択解除
      </Button>
      <Spacer y={1} />
      {clickedNode != null && (
        <>
          {attributes.map((e, i) => {
            return (
              <DetailCard
                key={i}
                label={translate[i]}
                value={
                  i == 0 || i == 1
                    ? formatTime(clickedNode.properties[e])
                    : clickedNode.properties[e]
                }
              />
            );
          })}
          <Card>
            <Card.Body>
              <Link
                href={`https://stratz.com/matches/${clickedNode.properties.matchId}`}
                target="_blank"
                underline
                isExternal
              >
                STRATZで見る
              </Link>
            </Card.Body>
          </Card>
          <Spacer y={0.5} />
          <Card>
            <Card.Body>
              <Link
                href={`https://www.youtube.com/results?search_query=${findText}`}
                target="_blank"
                underline
                isExternal
              >
                YouTubeで検索する
              </Link>
            </Card.Body>
          </Card>
          <Spacer y={0.5} />
        </>
      )}
    </>
  );
}

function formatTime(seconds) {
  const isNegative = seconds < 0;
  seconds = Math.abs(seconds);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${isNegative ? "-" : ""}${formattedMinutes}:${formattedSeconds}`;
}

function DetailCard({ label, value }) {
  return (
    <>
      <Grid.Container gap={1}>
        <Grid xs={7}>
          <CartText t={label} />
        </Grid>
        <Grid xs={5}>
          <CartText t={value} />
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
    </>
  );
}

function CartText({ t }) {
  return (
    <Card>
      <Card.Body>
        <Text>{t}</Text>
      </Card.Body>
    </Card>
  );
}

function NetworkChart({
  nodesData,
  linksData,
  clickedNode,
  setClickedNode,
  clickedAtr,
  outcomeFilter,
  setOutcomeFilter,
}) {
  const width = 1000;
  const height = 700;
  const margin = 0;
  const zoomX = 8 / 10;
  const zoomY = 9 / 10;
  const col = {
    NONE: "#fff",
    COMEBACK: blue,
    STOMPED: yellow,
    CLOSE_GAME: "#000",
  };
  const shape = {
    NONE: "M0,3 A3,3 0 1,1 0,-3 A3,3 0 1,1 0,3",
    COMEBACK:
      "M0,-4 L1.2682,-2.1908 L3.9021,-2.1908 L1.9055,0.948 L2.8531,3.8551 L0,1.5 L-2.8531,3.8551 L-1.9055,0.948 L-3.9021,-2.1908 L-1.2682,-2.1908 Z",
    STOMPED: "M-3,-3 L3,-3 L3,3 L-3,3 Z",
    CLOSE_GAME: "M0,-3 L2.5981,1.5 L-2.5981,1.5 Z",
  };

  function DrawOutcomeFilter() {
    return (
      <g>
        <rect x={3} y={3} width={140} height={115} fill="#999" opacity={0.6} />
        {Object.keys(col).map((e, index) => {
          return (
            <g
              key={e}
              transform={`translate(15,${index * 30 + 15})`}
              onClick={() => {
                outcomeFilter[e] = !outcomeFilter[e];
                setOutcomeFilter({ ...outcomeFilter });
              }}
              opacity={outcomeFilter[e] ? 1 : 0.2}
              style={{ cursor: "pointer" }}
            >
              <path d={shape[e]} fill={col[e]} transform="scale(3,3)" />
              <text
                alignmentBaseline="middle"
                textAnchor="MiddleLeft"
                x="20"
                y="1"
              >
                {e}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  if (nodesData.length == 0) {
    //console.log("no data");
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: "#ddd" }}
      >
        <DrawOutcomeFilter />
      </svg>
    );
  }

  const xScale =
    clickedNode != null
      ? d3
          .scaleLinear()
          .domain([clickedNode.x - zoomX, clickedNode.x + zoomX])
          .range([margin, width - margin])
          .nice()
      : d3
          .scaleLinear()
          .domain(d3.extent(nodesData.map((e) => e.x)))
          .range([margin, width - margin])
          .nice();
  const yScale =
    clickedNode != null
      ? d3
          .scaleLinear()
          .domain([clickedNode.y - zoomY, clickedNode.y + zoomY])
          .range([margin, height - margin])
          .nice()
      : d3
          .scaleLinear()
          .domain(d3.extent(nodesData.map((e) => e.y)))
          .range([margin, height - margin])
          .nice();
  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(nodesData.map((e) => e.properties[clickedAtr])))
    .range(["white", green])
    .nice();

  const scaleUp = nodesData.length < 200 || clickedNode != null ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: "#ddd" }}>
      {linksData.map((e) => {
        const highlight =
          clickedNode != null &&
          (e.source.id == clickedNode.id || e.target.id == clickedNode.id);
        return (
          <g key={e.id}>
            <path
              d={`M ${xScale(e.source.x)},${yScale(e.source.y)} L${xScale(
                e.target.x
              )},${yScale(e.target.y)}`}
              stroke={highlight ? pink : "#000"}
              strokeWidth={highlight ? 6 : 0.1}
              style={
                highlight
                  ? { cursor: "pointer", transition: "d 1s 0s" }
                  : { transition: "d 1s 0s" }
              }
              onClick={() => {
                if (highlight) {
                  const nodeId =
                    e.source.id == clickedNode.id ? e.target.id : e.source.id;
                  setClickedNode(nodesData.find((f) => f.id == nodeId));
                }
              }}
            />
          </g>
        );
      })}
      {nodesData.map((e) => {
        const highlight = clickedNode != null && e.id == clickedNode.id;
        const scale = (highlight ? 1.5 : 1) * scaleUp;
        return (
          <g key={e.id}>
            <path
              d={shape[e.properties.analysisOutcome]}
              transform={`translate(${xScale(e.x)},${yScale(
                e.y
              )}),scale(${scale},${scale})`}
              stroke={highlight ? pink : "none"}
              strokeWidth={0.5}
              fill={
                clickedAtr == null
                  ? col[e.properties.analysisOutcome]
                  : colorScale(e.properties[clickedAtr])
              }
              style={{
                transition: "d 1s 0s, transform 1s 0s",
                cursor: "pointer",
              }}
              onClick={() => {
                setClickedNode(e);
              }}
            />
          </g>
        );
      })}
      <DrawOutcomeFilter />
    </svg>
  );
}

function LineChart({ matchData, loading, toolTip, setToolTip }) {
  const width = 1000;
  const height = 700;
  const margin = 50;
  const yRange = [200, height - margin];
  const yRange2 = [
    yRange[0],
    yRange[0] + (yRange[1] - yRange[0]) / 2,
    yRange[1],
  ];
  if (matchData == null) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: "#ddd" }}
      >
        <text
          x={width / 2}
          y={height / 2}
          fontSize={56}
          style={{ textAnchor: "middle" }}
        >
          {loading ? "読み込み中！" : "ノードをクリックしてね！"}
        </text>
      </svg>
    );
  }
  const data = matchData.data.match;
  const radiantPlayer = data.players.filter((e) => e.isRadiant);
  const direPlayer = data.players.filter((e) => !e.isRadiant);
  //console.log(data);
  const xScale = d3
    .scaleLinear()
    .domain([0, data.radiantNetworthLeads.length - 1])
    .range([margin, width - margin]);
  const yScaleW = d3.scaleLinear().domain([1, 0]).range(yRange);
  const radiantNetworthLeadsMax = d3
    .extent(data.radiantNetworthLeads)
    .reduce((e, v) => {
      const av = Math.abs(v);
      return av > e ? av : e;
    }, 0);
  const radiantExperienceLeadsMax = d3
    .extent(data.radiantExperienceLeads)
    .reduce((e, v) => {
      const av = Math.abs(v);
      return av > e ? av : e;
    }, 0);
  const yScaleN = d3
    .scaleLinear()
    .domain([radiantNetworthLeadsMax, 0, -radiantNetworthLeadsMax])
    .range(yRange2);
  const yScaleE = d3
    .scaleLinear()
    .domain([radiantExperienceLeadsMax, 0, -radiantExperienceLeadsMax])
    .range(yRange2);
  const col = {
    winRates: "#000",
    radiantNetworthLeads: green,
    radiantExperienceLeads: blue,
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: "#ddd" }}>
      <DrawTitle
        data={data}
        radiantPlayer={radiantPlayer}
        direPlayer={direPlayer}
        width={width}
      />
      {
        <g>
          {data.radiantExperienceLeads.map((e, i) => {
            if (i % 5 != 0) {
              return <g key={i} />;
            }
            return (
              <g key={i}>
                <line
                  x1={xScale(i)}
                  y1={yRange[0]}
                  x2={xScale(i)}
                  y2={yRange[1]}
                  stroke="#000"
                  strokeWidth={i == 0 ? 3 : 1}
                  opacity={0.5}
                />
                <text
                  x={xScale(i)}
                  y={yRange[1]}
                  alignmentBaseline="text-before-edge"
                  style={{ textAnchor: "middle", textAlign: "end" }}
                >
                  {i}:00
                </text>
              </g>
            );
          })}
          <line
            x1={margin}
            y1={yRange2[1]}
            x2={width - margin}
            y2={yRange2[1]}
            stroke="#000"
            strokeWidth={2}
            opacity={0.5}
          />
          <line
            x1={margin}
            y1={yRange[1]}
            x2={width - margin}
            y2={yRange[1]}
            stroke="#000"
            strokeWidth={2}
            opacity={0.5}
          />
        </g>
      }
      {
        <g>
          <DrawLine
            data={data.winRates}
            xScale={xScale}
            yScale={yScaleW}
            fill={"#000"}
          />
          <DrawLine
            data={data.radiantNetworthLeads}
            xScale={xScale}
            yScale={yScaleN}
            fill={green}
          />
          <DrawLine
            data={data.radiantExperienceLeads}
            xScale={xScale}
            yScale={yScaleE}
            fill={blue}
          />
        </g>
      }
      <FaceVis
        player={radiantPlayer}
        xScale={xScale}
        yRange={yRange}
        isRadiant={true}
        setToolTip={setToolTip}
      />
      <FaceVis
        player={direPlayer}
        xScale={xScale}
        yRange={yRange}
        isRadiant={false}
        setToolTip={setToolTip}
      />
      {Object.keys(col).map((e, index) => {
        return (
          <g key={e} transform={`translate(70,${index * 30 + 205})`}>
            <circle x="0" y="0" r="10" fill={col[e]}></circle>
            <text
              alignmentBaseline="middle"
              textAnchor="MiddleLeft"
              x="20"
              y="3"
            >
              {e}
            </text>
          </g>
        );
      })}
      {toolTip != null && (
        <g>
          <rect
            x={toolTip.x - 150}
            y={toolTip.y}
            width={150}
            height={50}
            fill="#fff"
            opacity={0.8}
          />
          <text
            x={toolTip.x - 75}
            y={toolTip.y + 13}
            alignmentBaseline="middle"
            textAnchor="middle"
          >
            {multiKill[toolTip.value - 1]}
          </text>
          <text
            x={toolTip.x - 75}
            y={toolTip.y + 37}
            alignmentBaseline="middle"
            textAnchor="middle"
          >
            {formatTime(toolTip.time)}
          </text>
        </g>
      )}
    </svg>
  );
}

function FaceVis({ player, xScale, yRange, isRadiant, setToolTip }) {
  return player.map((e, i) => {
    const s = e.playbackData?.streakEvents.filter(
      (f) => f.type == "MULTI_KILL"
    );
    return s?.map((f, i) => {
      const size = f.value * 10;
      const x = xScale(f.time / 60) - size / 2;
      const y = isRadiant
        ? yRange[0] + ((f.value - 2) * size) / 2
        : yRange[1] - ((f.value - 2) * size) / 2 - size;
      return (
        <image
          key={i}
          x={x}
          y={y}
          width={size}
          height={size}
          href={`https://cdn.stratz.com/images/dota2/heroes/${e.hero.shortName}_icon.png`}
          opacity={0.8}
          onMouseOver={() => {
            setToolTip({ x: x, y: y, value: f.value, time: f.time });
          }}
          onMouseOut={() => {
            setToolTip(null);
          }}
        />
      );
    });
  });
}

function DrawTitle({ data, radiantPlayer, direPlayer, width }) {
  const t = 30;
  const w = 5 * t;
  const h = 3 * t;
  return (
    <g>
      <text x={width / 2} y={0} style={{ textAnchor: "middle" }}>
        <tspan
          x={width / 2}
          dy={0}
          fontSize={28}
          alignmentBaseline="text-before-edge"
        >
          {data.league.displayName}
        </tspan>
        <tspan
          x={50 + w + 20}
          dy={70}
          fontSize={28}
          alignmentBaseline="text-before-edge"
          style={{ textAnchor: "start" }}
        >
          {data.radiantTeam.name}
        </tspan>
        <tspan
          x={width / 2}
          dy={0}
          fontSize={28}
          alignmentBaseline="text-before-edge"
        >
          {" "}
          VS{" "}
        </tspan>
        <tspan
          x={width - w - 50 - 20}
          dy={0}
          fontSize={28}
          alignmentBaseline="text-before-edge"
          style={{ textAnchor: "end" }}
        >
          {data.direTeam.name}
        </tspan>
      </text>
      <image
        x={50}
        y={35}
        width={w}
        height={h}
        href={`https://cdn.stratz.com/images/dota2/teams/${data.radiantTeam.id}.png`}
      />
      <image
        x={width - w - 50}
        y={35}
        width={w}
        height={h}
        href={`https://cdn.stratz.com/images/dota2/teams/${data.direTeam.id}.png`}
      />
      {radiantPlayer.map((e, i) => {
        return (
          <image
            key={i}
            x={i * 75}
            y={45 + h}
            width={w}
            height={h / 1.5}
            href={`https://cdn.stratz.com/images/dota2/heroes/${e.hero.shortName}_icon.png`}
          />
        );
      })}
      {direPlayer.map((e, i) => {
        return (
          <image
            key={i}
            x={width - w + -i * 75}
            y={45 + h}
            width={w}
            height={h / 1.5}
            href={`https://cdn.stratz.com/images/dota2/heroes/${e.hero.shortName}_icon.png`}
          />
        );
      })}
    </g>
  );
}

function DrawLine({ data, xScale, yScale, fill }) {
  return data.map((e, i, ary) => {
    return (
      <g key={i}>
        <circle cx={xScale(i)} cy={yScale(e)} r={3} fill={fill} />
        {i <= ary.length - 2 && (
          <line
            x1={xScale(i)}
            y1={yScale(e)}
            x2={xScale(i + 1)}
            y2={yScale(ary[i + 1])}
            stroke={fill}
            strokeWidth={1}
          />
        )}
      </g>
    );
  });
}
