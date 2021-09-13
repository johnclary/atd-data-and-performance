import React from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { ListGroup } from "react-bootstrap";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import { DataMetaData } from "../components/Metadata";
import { useSocrata } from "../utils/socrata.js";
import { SIGNAL_STATUS_QUERY } from "../components/queries";

const OPERATION_STATES = [
  {
    key: "scheduled_flash",
    value: "1",
    label: "Scheduled Flash",
    color: "#d95f02",
    featureProp: "operation_state",
    checked: true,
  },
  {
    key: "unscheduled_flash",
    value: "2",
    label: "Unscheduled Flash",
    color: "#7570b3",
    featureProp: "operation_state",
    checked: true,
  },
  {
    key: "comm_outage",
    value: "3",
    label: "Comm Outage",
    color: "#1b9e77",
    featureProp: "operation_state",
    checked: true,
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
      <p key="body" className="my-0">
        <small>
          <small>
            {renderOperationState(feature.properties.operation_state)}
          </small>
        </small>
      </p>
    </>
  );
};

const FlexyInfo = ({ label, value }) => {
  return (
    <div className="d-flex w-100 justify-content-between">
      <p className="fw-bold my-0">
        <small>{label}</small>
      </p>
      <p className="my-0">
        <small>{value}</small>
      </p>
    </div>
  );
};

const detailsRenderer = (feature) => {
  return (
    <Col>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <span className="fs-4 fw-bold me-2">
            {feature.properties.location_name}
          </span>
          <span className="text-muted fst-italic">cool info!</span>
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
      OPERATION_STATES[0].color,
      "2",
      OPERATION_STATES[1].color,
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

export function CardItem({ title, value }) {
  return (
    <Card className="h-100 shadow-sm pb-2 text-center">
      <Card.Body>
        <h5 className="text-dts-4">{title}</h5>
        <h3 className="text-dts-6">{value}</h3>
      </Card.Body>
    </Card>
  );
}

/**
 * Calculates count of signals by status type
 * @param {object} data Geojson FeatureCollection of signal features
 * @returns {object} an object map with one key/count per status
 */
const useMetricData = (data) => {
  const [metricData, setMetricData] = React.useState({});

  React.useEffect(() => {
    if (!data) return;
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
  return (
    <>
      <Nav />
      <Container fluid>
        <Row key="title">
          <Col>
            <h2 className="text-primary">Traffic Signal Monitor</h2>
          </Col>
        </Row>
        <Row key="metrics">
          {OPERATION_STATES.map((opState) => {
            return (
              <Col key={opState.key} className="pb-2">
                <CardItem
                  title={opState.label}
                  value={metricData[opState.value] || 0}
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
