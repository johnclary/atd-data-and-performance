import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { ListGroup } from "react-bootstrap";
import { FaExclamationTriangle, FaClock, FaPhone } from "react-icons/fa";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import { DataMetaData } from "../components/Metadata";
import { useSocrata } from "../utils/socrata.js";
import { SIGNAL_STATUS_QUERY } from "../components/queries";

const COLORS = {
  red: "#e41a1c",
  lightRed: "#e05557",
  orange: "#ff7f00",
  lightOrange: "#ffa54d",
  blue: "#377eb8",
  lightBlue: "#578eba",
};

const OPERATION_STATES = [
  {
    key: "unscheduled_flash",
    value: "2",
    label: "Unscheduled Flash",
    color: COLORS.red,
    backgroundColor: COLORS.lightRed,
    featureProp: "operation_state",
    checked: true,
    icon: FaExclamationTriangle,
  },
  {
    key: "scheduled_flash",
    value: "1",
    label: "Scheduled Flash",
    color: COLORS.orange,
    backgroundColor: COLORS.lightOrange,
    featureProp: "operation_state",
    checked: true,
    icon: FaClock,
  },
  {
    key: "comm_outage",
    value: "3",
    label: "Comm Outage",
    color: COLORS.blue,
    backgroundColor: COLORS.lightBlue,
    featureProp: "operation_state",
    checked: true,
    icon: FaPhone,
  },
];

const renderOperationState = (inputOpState) => {
  const opState = OPERATION_STATES.find((opState) => {
    return opState.value === inputOpState;
  });
  return (
    <span
      style={{ borderColor: opState.color, color: opState.color }}
      className="status-badge"
    >
      {opState?.label || ""}
    </span>
  );
};

const listItemRenderer = (feature) => {
  return (
    <>
      <p key="title" className="fw-bold my-0">
        <small>{feature.properties.location_name}</small>
      </p>
      <div className="d-flex w-100 justify-content-end">
        <p key="body" className="my-0">
          <small>
            <small>
              {renderOperationState(feature.properties.operation_state)}
            </small>
          </small>
        </p>
      </div>
    </>
  );
};

const FlexyInfo = ({ label, value }) => {
  return (
    <div className="d-flex w-100 justify-content-between">
      <span className="fw-bold">
        <small>{label}</small>
      </span>
      <span>
        <small>{value}</small>
      </span>
    </div>
  );
};

const detailsRenderer = (feature) => {
  return (
    <Col>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <span className="fs-4 fw-bold">
            {feature.properties.location_name}
          </span>
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo
            label="Status"
            value={renderOperationState(feature.properties.operation_state)}
          />
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo
            label="Status date"
            value={new Date(
              feature.properties.operation_state_datetime
            ).toLocaleString()}
          />
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo label="Signal ID" value={feature.properties.signal_id} />
        </ListGroup.Item>
      </ListGroup>
    </Col>
  );
};

const POINT_LAYER_STYLE = {
  id: "points",
  paint: {
    "circle-color": [
      "match",
      ["get", "operation_state"],
      "1",
      OPERATION_STATES[1].color,
      "2",
      OPERATION_STATES[0].color,
      "3",
      OPERATION_STATES[2].color,
      /* other */ "#ccc",
    ],
  },
};

const FILTERS = {
  checkbox: OPERATION_STATES,
  search: {
    key: "search",
    value: "",
    featureProp: "location_name",
    label: "Search",
    placeholder: "Search by location...",
  },
};

const Metric = ({ title, value, backgroundColor, icon: Icon }) => {
  return (
    <>
      <h4 className="text-primary text-center">
        <Icon /> {title}{" "}
      </h4>
      <h4 className="text-center">
        <span
          className="my-0 font-monospace"
          style={
            value
              ? { backgroundColor: backgroundColor, color: "#fff" }
              : { color: "#6c757d" }
          }
        >
          {<small className="mx-2">{value}</small>}
        </span>
      </h4>
    </>
  );
};

/**
 * Calculates count of signals by status type
 * @param {object} data Geojson FeatureCollection of signal features
 * @returns {object} an object map with one key/count per status
 */
const useMetricData = (data) => {
  const [metricData, setMetricData] = React.useState({});

  React.useEffect(() => {
    if (!data) return;
    // for development: uncomment to mock data for all states
    // data.features[0].properties.operation_state = "2";
    // data.features[1].properties.operation_state = "1";
    // data.features[2].properties.operation_state = "1";
    // data.features[3].properties.operation_state = "1";
    // data.features[4].properties.operation_state = "3";
    let currentData = {};
    data.features.forEach((feature) => {
      let operationState = feature.properties.operation_state;
      if (!(operationState in currentData)) currentData[operationState] = 0;
      currentData[operationState]++;
    });
    setMetricData(currentData);
  }, [data]);
  return metricData;
};

export default function Viewer() {
  const { data, loading, error } = useSocrata(SIGNAL_STATUS_QUERY);
  const metricData = useMetricData(data);

  if (loading) return <p>Loading...</p>;
  if (error || !data) return <p>{error?.message || "something went wrong"}</p>;

  return (
    <>
      <Nav />
      <Container fluid>
        <Row key="title">
          <Col>
            <h2 className="text-primary">Traffic Signal Monitor</h2>
          </Col>
        </Row>
        <Row key="metrics" className="justify-content-lg-center mb-2">
          {OPERATION_STATES.map((opState) => {
            return (
              <Col key={opState.key} xs={12} lg={4}>
                <Metric
                  title={opState.label}
                  value={metricData[opState.value] || 0}
                  icon={opState.icon}
                  backgroundColor={opState.backgroundColor}
                />
              </Col>
            );
          })}
        </Row>
        <DataMetaData resourceId={SIGNAL_STATUS_QUERY.resourceId} />
        <GeoList
          geojson={data}
          listItemRenderer={listItemRenderer}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
          detailsRenderer={detailsRenderer}
        />
        <Row key="about-title" className="mt-4 mb-2 text-primary">
          <Col>
            <h4>About the Traffic Signal Monitor</h4>
          </Col>
        </Row>
        <Row key="about-content" className="text-primary">
          <Col key="col-1">
            <h5 className="text-dts-4">What am I Looking at?</h5>
            <p>
              This dashboard reports the operation status of traffic signals in
              Austin, TX. Traffic signals enter flash mode when something is
              preventing the signal from operating normally. This is typically
              the result of a power surge, power outage, or damage to signal
              equipment. A signal may also be intentionally placed into flash
              mode for maintenance purposes or be scheduled to flash overnight.
            </p>
          </Col>
          <Col key="col-2">
            <h5 className="text-dts-4">Advanced Transportation Management</h5>
            <p>
              All of the City’s signals communicate with our Advanced
              Transportation Management System. When these signals go on flash,
              they will be reported on this dashboard. It also occasionally
              happens that the event that disables a traffic signal also
              disables network communication to the signal, in which case the
              signal outage will not be reported here.
            </p>
          </Col>
          <Col key="col-3">
            <h5 className="text-dts-4">Report an Issue</h5>
            <p>
              To report an issue or request a new traffic signal, call 3-1-1.
              You can also{" "}
              <a href="https://austin-csrprodcwi.motorolasolutions.com/ServiceRequest.mvc/SRIntakeStep2/TRASIGNE?guid=59340171d27247fa93fe951cdaf37dcc">
                submit a traffic signal service request online
              </a>
              .
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
