import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import useSocrata from "../utils/socrata.js";
import {
  SIGNAL_RETIMING_QUERY,
  SIGNAL_CORRIDORS_QUERY,
} from "../components/queries";

const formatPercent = (value, places = 0) => {
  return `${parseFloat(value * 100).toFixed(places)}%`;
};

const FILTERS = {
  search: {
    key: "search",
    value: "",
    featureProp: "system_name",
    label: "Search",
    placeholder: "Search by location...",
  },
};

const POINT_LAYER_ID = "points";

const POINT_LAYER_STYLE = {
  id: POINT_LAYER_ID,
  paint: {
    "circle-color": "#7B76B5",
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 1,
  },
};

const listItemRenderer = (feature) => {
  return (
    <>
      <div className="d-flex w-100 justify-content-between">
        <p className="fw-bold my-0">
          <small>{feature.properties.system_name}</small>
        </p>
        <p className="my-0">
          <small>{feature.properties.retime_status}</small>
        </p>
      </div>
    </>
  );
};

const mapOverlayConfig = {
  titleKey: "system_name",
  bodyKeys: [
    { key: "retime_status", label: "Status" },
    { key: "signal_count", label: "# of Signals" },
    { key: "vol_wavg_tt_pct_change", label: "Travel Time Change" },
    { key: "engineer_note", label: "Note" },
  ],
};

// Styling effect which will be called when selectedFeature changes
const selectedFeatureEffect = (map, selectedFeature) => {
  // set different circle color for selected feature
  const matchValue = selectedFeature?.properties.system_id || "";
  map.setPaintProperty(POINT_LAYER_ID, "circle-color", [
    "match",
    ["get", "system_id"],
    matchValue,
    "#DC6E2C",
    "#7B76B5",
  ]);
  // ensure circles in the selected feature draw on top of other features
  // important because we have overlapping features
  map.setLayoutProperty(POINT_LAYER_ID, "circle-sort-key", [
    "match",
    ["get", "system_id"],
    matchValue,
    1,
    0,
  ]);
};

// factory function which creates an empty geojson feature
const constructCorridorFeature = ({ system_id, system_name }) => {
  return {
    type: "Feature",
    properties: { system_id, system_name },
    geometry: { type: "MultiPoint", coordinates: [] },
  };
};

const useMultiPointCorridors = (features) => {
  const [signalCorridors, setSignalCorridors] = React.useState({
    type: "FeatureCollection",
    features: [],
  });
  React.useEffect(() => {
    if (!features || features.length === 0) return;
    let corridorIndex = {};
    features.forEach((feature) => {
      let system_id = feature.properties.system_id;
      let system_name = feature.properties.system_name;

      if (!(system_id in corridorIndex)) {
        // create a new json feature to hold all signals in this corridor
        corridorIndex[system_id] = constructCorridorFeature({
          system_id,
          system_name,
        });
      }
      let coordinates = feature.geometry.coordinates;
      coordinates &&
        corridorIndex[system_id].geometry.coordinates.push(coordinates);
    });
    let newFeatures = Object.keys(corridorIndex).map(
      (key) => corridorIndex[key]
    );
    setSignalCorridors({
      type: "FeatureCollection",
      features: newFeatures,
    });
  }, [features]);
  return signalCorridors;
};

const useYears = (data) => {
  const [years, setYears] = React.useState([]);
  const [selectedYear, setSelectedYear] = React.useState(null);

  React.useEffect(() => {
    if (!data || data.length === 0) return;
    let allYears = data.map((row) => {
      return row.scheduled_fy;
    });
    // TODO: think about this
    // set the current selected year to the most recent, or if no years, 2016...why not? hopefully does not happen
    setSelectedYear(allYears[allYears.length - 1] || "2016");
    setYears([...new Set(allYears)]);
  }, [data]);

  return { years, selectedYear, setSelectedYear };
};

const useFilteredRetimingData = (data, selectedYear) => {
  const [retimingDataFiltered, setRetimingDataYear] = React.useState([]);
  React.useEffect(() => {
    if (!data || data.length === 0) return;
    let thisYearData = data.filter((row) => {
      return row.scheduled_fy === selectedYear;
    });
    setRetimingDataYear(thisYearData);
  }, [data, selectedYear]);
  return retimingDataFiltered;
};

// filters corridor by years **and** joins retiming data
const useFilteredCorridors = (signalCorridors, retimingDataFiltered) => {
  const [signalCorridorsFiltered, setSignalCorridorsYear] = React.useState([]);
  React.useEffect(() => {
    if (
      !signalCorridors ||
      signalCorridors.length === 0 ||
      !retimingDataFiltered ||
      retimingDataFiltered.length === 0
    )
      return;

    let mutableCorridors = { ...signalCorridors };
    let filteredCorridorFeatures = [];

    mutableCorridors.features.map((corridor) => {
      const corridorID = corridor.properties.system_id;
      // for every corridor, see if there is a matching retiming record (which has already been filtered for the selected year)
      const thisRetimingData = retimingDataFiltered.find((retimingData) => {
        return retimingData.system_id === corridorID;
      });

      if (thisRetimingData) {
        // merge the retiming data into the corridor properties
        corridor.properties = { ...corridor.properties, ...thisRetimingData };
        filteredCorridorFeatures.push(corridor);
      }
    });
    mutableCorridors.features = filteredCorridorFeatures;
    setSignalCorridorsYear(mutableCorridors);
  }, [signalCorridors, retimingDataFiltered]);

  return signalCorridorsFiltered;
};

const PieLabel = ({ summaryStats }) => {
  const pctComplete =
    summaryStats.complete / (summaryStats.incomplete + summaryStats.complete);
  return (
    <>
      <text
        fontSize="40px"
        x="50%"
        y="45%"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {formatPercent(pctComplete)}
      </text>
      <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle">
        {`${summaryStats.complete} of ${
          summaryStats.incomplete + summaryStats.complete
        }`}
      </text>
    </>
  );
};

const useSummaryStats = (retimingDataFiltered, signalCorridorsRaw) => {
  // TODO: simplifiy with reducer
  const [summaryStats, setSummaryStats] = React.useState({
    complete: 0,
    incomplete: 0,
  });

  React.useEffect(() => {
    if (
      !retimingDataFiltered ||
      retimingDataFiltered.length === 0 ||
      !signalCorridorsRaw ||
      signalCorridorsRaw.length === 0
    )
      return;
    let corridorStatusIndex = {};
    retimingDataFiltered.forEach((corridor) => {
      corridorStatusIndex[corridor.system_id] = corridor.retime_status;
    });
    let signalStatusIndex = {};

    signalCorridorsRaw.forEach((signal) => {
      const signalId = signal.properties.signal_id;
      const systemId = String(signal.properties.system_id);
      const retimeStatus = corridorStatusIndex[systemId];
      if (!retimeStatus) {
        return;
      }
      const existingSignalStatus = signalStatusIndex[signalId];
      // if the signal is in multiple corridors, it's counted as complete if any instance is complete
      if (existingSignalStatus && existingSignalStatus == "COMPLETED") {
        return;
      }
      signalStatusIndex[signalId] = retimeStatus;
    });
    let newSummaryStats = { complete: 0, incomplete: 0 };
    Object.values(signalStatusIndex).forEach((status) => {
      if (status === "COMPLETED") {
        newSummaryStats.complete++;
      } else {
        newSummaryStats.incomplete++;
      }
    });
    setSummaryStats(newSummaryStats);
  }, [retimingDataFiltered, signalCorridorsRaw]);
  return summaryStats;
};

const ProgressChart = ({ summaryStats }) => {
  const colors = { gray: "#bfbfbf", green: "#009406" };
  const [pieData, setPieData] = React.useState([]);

  React.useEffect(() => {
    let newPieData = [
      {
        name: "incomplete",
        value: summaryStats.incomplete,
      },
      {
        name: "complete",
        value: summaryStats.complete,
      },
    ];
    setPieData(newPieData);
  }, [summaryStats]);

  return (
    <ResponsiveContainer height={200}>
      <PieChart width={"100%"} height={"100%"}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={"70%"}
          outerRadius={"100%"}
          startAngle={90}
          endAngle={550}
        >
          <Cell fill={colors.gray} />
          <Cell fill={colors.green} />
          {/* <Label offset={0} position="center">
            {formatPercent(pctComplete, 0)}
          </Label> */}
          <Label
            content={<PieLabel summaryStats={summaryStats} />}
            offset={0}
            position="center"
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const retimingStatsReducer = (accumulator, currentValue) => {
  accumulator.total_vol =
    accumulator.total_vol + parseFloat(currentValue?.total_vol || 0);
  accumulator.vol_wavg_tt_seconds =
    accumulator.vol_wavg_tt_seconds +
    parseFloat(currentValue?.vol_wavg_tt_seconds || 0);
  return accumulator;
};

export default function Viewer() {
  const signalCorridorsRaw = useSocrata(SIGNAL_CORRIDORS_QUERY);
  const retimingDataRaw = useSocrata(SIGNAL_RETIMING_QUERY);

  const signalCorridors = useMultiPointCorridors(
    signalCorridorsRaw.data?.features
  );

  const { years, selectedYear, setSelectedYear } = useYears(
    retimingDataRaw.data
  );

  const retimingDataFiltered = useFilteredRetimingData(
    retimingDataRaw.data,
    selectedYear
  );

  const signalCorridorsFiltered = useFilteredCorridors(
    signalCorridors,
    retimingDataFiltered
  );

  const summaryStats = useSummaryStats(
    retimingDataFiltered,
    signalCorridorsRaw.data?.features
  );

  let totalTravelTimeChange;
  // this calls every render (~three times per year change). todo: use a hook
  if (retimingDataFiltered?.length > 0) {
    let totals = retimingDataFiltered.reduce(retimingStatsReducer, {
      total_vol: 0,
      vol_wavg_tt_seconds: 0,
    });
    totalTravelTimeChange = totals.vol_wavg_tt_seconds / totals.total_vol;
  }
  if (signalCorridorsRaw.error || retimingDataRaw.error)
    return (
      <>
        <Nav />
        <Container fluid>
          <h1>something went wrong :(</h1>
        </Container>
        <Footer />
      </>
    );

  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col xs={12} md={4}>
            <h2 className="text-primary">Signal Timing</h2>
            <p className="text-primary">
              This dashboard reports the progress of the Austin Transportation
              Department&aposs Annual Signal Timing Program. Beginning in 2017,
              traffic signal engineers will re-time approximately 1/3 of the
              city’s 1,000+ signals each year, with the goal of ensuring signals
              are timed for optimum safety and performance.{" "}
              <a href="https://data.mobility.austin.gov/signal-timing/#about">
                More info
              </a>
              .
            </p>
          </Col>
          <Col>
            <Row>
              <Col xs={12} md={4} lg={3} xl={2} className="mx-auto">
                <InputGroup>
                  <Form.Label className="text-primary my-auto me-2">
                    Year
                  </Form.Label>
                  <Form.Select
                    aria-label="Year selector"
                    onChange={(e) => setSelectedYear(e.target.value)}
                    value={selectedYear || ""}
                  >
                    {years.map((year) => {
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6} className="text-center">
                <h5 className="text-primary">Signals Re-Timed</h5>
                <ProgressChart summaryStats={summaryStats} />
              </Col>
              <Col xs={12} md={6} className="text-center">
                <h5 className="text-primary">Travel Time Reduced</h5>
                <span style={{ fontSize: "52px" }}>
                  {totalTravelTimeChange &&
                    formatPercent(totalTravelTimeChange, 1)}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
        <GeoList
          geojson={signalCorridorsFiltered}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
          selectedFeatureEffect={selectedFeatureEffect}
          mapOverlayConfig={mapOverlayConfig}
          listItemRenderer={listItemRenderer}
        />
      </Container>
      <Footer />
    </>
  );
}
