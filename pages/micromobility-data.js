import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import BsTable from "react-bootstrap/Table";
import { format as d3Format } from "d3-format";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useSocrata from "../utils/socrata.js";
import DatePicker from "../components/DatePicker";
import {
  MICROMOBILITY_BY_MODE_QUERY,
  MICROMOBILITY_DEVICE_COUNT_QUERY,
  MICROMOBILITY_311_QUERY,
} from "../components/queries";
import styles from "../styles/Micromobility.module.css";

console.log("remember to handle silent (and not silent) socrata errors...");

const formatSocrataDate = (date, name) => {
  // Format a socrata friendly date string...preserving UTC along the way to avoid localization issues
  // TODO: are MDS timestamps really in central time?
  if (!date) return null;
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  const timeString = name === "startDate" ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day}T${timeString}`;
};

const formatQuery = ({ queryString, queryDates }) => {
  // replace placeholder args with current values from state of queryParams
  Object.keys(queryDates).forEach((arg) => {
    queryString = queryString.replace(
      `$${arg}`,
      formatSocrataDate(queryDates[arg], arg)
    );
  });
  return queryString;
};

const useQuery = ({ queryDef, queryDates }) => {
  const [query, setQuery] = React.useState(queryDef);
  React.useEffect(() => {
    // we deep copy the queryDef, which is immutable and retains the placeholder param names
    let mutableQuery = { ...queryDef, args: [...queryDef.args] };
    // todo: we assume the first argument in the queryDef is the `query` param. gross?
    let queryString = mutableQuery.args[0].value.slice();
    queryString = formatQuery({ queryString, queryDates });
    mutableQuery.args[0] = { key: "query", value: queryString };
    setQuery(mutableQuery);
  }, [queryDates, queryDef]);
  return query;
};

const initStartDate = () => {
  // return the first day of the month if today is after the 10th, otherwise the first of last month
  // this importantly ensures there is data in the table that renders on init
  let startDate = new Date();
  if (startDate.getDate() < 10) startDate.setMonth(startDate.getMonth() - 1);
  startDate.setDate(1);
  return startDate;
};

const initDates = {
  startDate: initStartDate(),
  endDate: new Date(),
};

const isValid = (queryParams) => {
  // return false if any queryParam values are falsey
  return Object.keys(queryParams).every((q) => queryParams[q]);
};

export default function Viewer() {
  // set on date picker change
  const [selectedDates, setSelectedDates] = React.useState(initDates);
  // set on submit button click - triggers data re-fetch
  const [queryDates, setQueryDates] = React.useState(initDates);

  const dataByModeQuery = useQuery({
    queryDef: MICROMOBILITY_BY_MODE_QUERY,
    queryDates,
  });

  const deviceCountQuery = useQuery({
    queryDef: MICROMOBILITY_DEVICE_COUNT_QUERY,
    queryDates,
  });

  const threeOneOneQuery = useQuery({
    queryDef: MICROMOBILITY_311_QUERY,
    queryDates,
  });
  console.log(dataByModeQuery);
  const dataByMode = useSocrata(dataByModeQuery);
  const deviceCount = useSocrata(deviceCountQuery);
  const threeOneOne = useSocrata(threeOneOneQuery);

  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Shared Mobility</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <div className="d-flex flex-nowrap justify-content-center">
              <Form.Label className="pe-2 my-auto">From </Form.Label>
              <DatePicker
                required
                clearIcon={null}
                calendarIcon={null}
                locale="en-US"
                minDate={new Date("2018-04-01")}
                maxDate={new Date()}
                value={selectedDates.startDate}
                onChange={(date) => {
                  setSelectedDates({
                    ...selectedDates,
                    startDate: date,
                  });
                }}
              />
              <Form.Label className="ps-4 pe-2 my-auto">To </Form.Label>
              <DatePicker
                required
                clearIcon={null}
                calendarIcon={null}
                locale="en-US"
                minDate={new Date("2018-04-01")}
                maxDate={new Date()}
                value={selectedDates.endDate}
                onChange={(date) => {
                  setSelectedDates({
                    ...selectedDates,
                    endDate: date,
                  });
                }}
              />
              <Button
                size="sm"
                className={"ms-4"}
                onClick={() => {
                  let newQueryDates = { ...selectedDates };
                  if (isValid(newQueryDates)) {
                    setQueryDates(newQueryDates);
                  } else {
                    // todo: this?
                    alert("invalid");
                  }
                }}
              >
                Apply filters
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <div>
              {dataByMode.data &&
                deviceCount.data &&
                deviceCount.data?.length > 0 &&
                dataByMode.data?.length > 0 && (
                  <Table
                    dataByMode={dataByMode.data}
                    deviceCount={deviceCount.data}
                    threeOneOne={threeOneOne.data}
                  />
                )}
              {(dataByMode.loading ||
                deviceCount.loading ||
                threeOneOne.loading) && (
                <>
                  <p className="me-4 text-primary">
                    Searching millions of records...
                  </p>
                  <Spinner
                    className="text-secondary"
                    animation="border"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              )}
              {dataByMode.data &&
                deviceCount.data &&
                deviceCount.data?.length === 0 &&
                dataByMode.data?.length === 0 && <p>nada</p>}
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="text-dts-4">
            <h5>About</h5>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={4}>
            <p>
              This page summarizes shared micromobility trips reported to the
              City of Austin Transportation Department as part of the
              Micromobility operating rules. Data is drawn from our shared
              micromobility vehicle trips dataset, which spans from April 2018
              and is updated on a daily basis.
            </p>

            <p>
              A trip record is included in this summary report if it meets the
              following criteria: Trip distance at least 0.1 miles and less than
              500 miles Trip duration less than 24 hours
            </p>
          </Col>
          <Col xs={12} md={4}>
            <p>
              A trip record is included in this summary report if it meets the
              following criteria: Trip distance at least 0.1 miles and less than
              500 miles Trip duration less than 24 hours
            </p>
          </Col>
          <Col xs={12} md={4}>
            <p>
              This page summarizes shared micromobility trips reported to the
              City of Austin Transportation Department as part of the
              Micromobility operating rules. Data is drawn from our shared
              micromobility vehicle trips dataset, which spans from April 2018
              and is updated on a daily basis.
            </p>

            <p>
              A trip record is included in this summary report if it meets the
              following criteria: Trip distance at least 0.1 miles and less than
              500 miles Trip duration less than 24 hours
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}

const renderThousands = (n) => {
  return d3Format(",d")(n);
};

const renderDecimal = (n) => {
  return d3Format(",.1f")(n);
};

const metrics = [
  {
    key: "unique_devices",
    label: "Unique devices",
    src: "deviceCount",
    renderer: renderThousands,
    isAverage: false,
  },
  {
    key: "avg_duration_minutes",
    label: "Trip duration (avg, minutes)",
    src: "dataByMode",
    renderer: renderDecimal,
    isAverage: true,
  },
  {
    key: "avg_miles",
    label: "Miles traveled (avg)",
    src: "dataByMode",
    renderer: renderDecimal,
    isAverage: true,
  },
  {
    key: "total_miles",
    label: "Miles traveled (total)",
    src: "dataByMode",
    renderer: renderThousands,
    isAverage: false,
  },
  {
    key: "total_trips",
    label: "Total trips",
    src: "dataByMode",
    renderer: renderThousands,
    isAverage: false,
  },
];

const modes = [
  {
    key: "scooter",
    label: "Scooters",
  },
  { key: "bicycle", label: "Bicycles" },
  { key: "moped", label: "Mopeds" },
];

const idModes = (metrics, key = "vehicle_type") => {
  /*
    Convert array of metrics to an object where each metric is identified by it's mode
    E.g., convert this:
      [
        { vehicle_type: "bicycle", unique_devices: "302" },
        { vehicle_type: "scooter", unique_devices: "9927" }
      ];

    to:

      {
        "bicycle": {
            "vehicle_type": "bicycle",
            "unique_devices": "302"
        },
        "scooter": {
            "vehicle_type": "scooter",
            "unique_devices": "9930"
        }
      }

    We do this because it makes it easier to access table cell data
  */
  let withIds = {};
  metrics.forEach((metric) => {
    const id = metric[key];
    return (withIds[id] = metric);
  });
  return withIds;
};

const addTotals = (tableRowData) => {
  // Calculate metrics for all modes
  tableRowData["all_modes"] = {};

  metrics.forEach((metric) => {
    // logic here to calculate weighted averages based on if the metrics is an average
    let total = 0;
    let sumWeights = 0;

    modes.forEach((mode) => {
      const val = parseFloat(tableRowData[mode.key]?.[metric.key] || 0);
      const weight = parseFloat(tableRowData[mode.key]?.["total_trips"] || 0);
      total = metric.isAverage ? val * weight + total : total + val;
      sumWeights = metric.isAverage ? sumWeights + weight : 1;
    });

    tableRowData["all_modes"][metric.key] = metric.isAverage
      ? total / sumWeights
      : total;
  });
};

export function Table({ dataByMode, deviceCount, threeOneOne }) {
  // we could be using state/hooks for this pre-processing, but i found it daunting and
  // we're dealing with a really small amount of data
  let dataByModeId = idModes(dataByMode);
  let deviceCountId = idModes(deviceCount);
  let tableRowData = {};
  Object.keys(deviceCountId).forEach((key) => {
    tableRowData[key] = { ...dataByModeId[key], ...deviceCountId[key] };
  });
  addTotals(tableRowData);

  return (
    <BsTable className="table-borderless" responsive hover>
      <thead className={styles["table-header"]}>
        <tr>
          <th key="metric_name"></th>
          {modes.map((mode, i) => {
            return (
              <th className="text-end" key={i}>
                <span className="ps-md-4">{mode.label}</span>
              </th>
            );
          })}
          <th key="all_modes" className="text-end">
            All modes
          </th>
        </tr>
      </thead>
      <tbody className={styles["table-body"]}>
        <tr key="threeOneOne">
          <td
            key="threeOneOne"
            className={`${styles["metric-name"]} text-start`}
          >
            {" "}
            311 service requests
          </td>
          {modes.map((mode) => (
            <td className="text-end text-dts-1" key={mode.key}>
              -
            </td>
          ))}
          <td key="all_modes" className="text-end">
            {threeOneOne?.[0]?.count || 0}
          </td>
        </tr>
        {metrics.map((metric) => {
          return (
            <tr key={metric.key}>
              <td
                key={metric.key}
                className={`${styles["metric-name"]} text-start`}
              >
                {metric.label}
              </td>
              {modes.map((mode) => {
                let val = tableRowData[mode.key]?.[metric.key];
                let displayVal = val ? metric.renderer(val) : 0;
                return (
                  <td key={mode.key} className="text-end">
                    {displayVal}
                  </td>
                );
              })}
              <td key={"all_modes"} className="text-end">
                {metric.renderer(tableRowData["all_modes"][metric.key])}
              </td>
            </tr>
          );
        })}
      </tbody>
    </BsTable>
  );
}
