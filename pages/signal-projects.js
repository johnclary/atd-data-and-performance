import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import { useSocrata } from "../utils/socrata.js";
import { DataMetaData } from "../components/Metadata";
import { SIGNAL_REQUESTS_QUERY } from "../components/queries";

import { signalData } from "../utils/signalData";

const STATUS_STYLES = {
  DESIGN: {
    label: "Design",
    borderColor: "#7570b3",
    color: "#7570b3",
  },
  CONSTRUCTION: {
    label: "Construction",
    borderColor: "#d95f02",
    color: "#d95f02",
  },
  TURNED_ON: {
    label: "Turned On",
    borderColor: "#1b9e77",
    color: "#1b9e77",
  },
  "READY FOR CONSTRUCTION": {
    label: "Ready for Construction",
    borderColor: "#1b9e77",
    color: "#1b9e77",
  },
};

const renderSignalStatus = (status) => {
  if (!status || !STATUS_STYLES[status]) return "";
  const { label, ...styles } = STATUS_STYLES[status];
  return (
    <span style={styles} className="status-badge">
      {label || status}
    </span>
  );
};

const renderSignalType = (type) => {
  switch (type) {
    case "TRAFFIC":
      return "Traffic signal";
    case "PHB":
      return "Pedestrian signal";
    default:
      return "";
  }
};

const listItemRenderer = (feature) => {
  return (
    <>
      <p className="fw-bold my-0">
        <small>{feature.properties.location_name}</small>
      </p>
      <div className="d-flex w-100 justify-content-between">
        <p className="my-0">
          <small>{renderSignalType(feature.properties.signal_type)}</small>
        </p>
        <p className="my-0 text-nowrap">
          <small>
            <small>
              {renderSignalStatus(feature.properties.signal_status)}
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
          <span className="text-muted fst-italic">
            {renderSignalType(feature.properties.signal_type)}
          </span>
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo
            label="Status"
            value={renderSignalStatus(feature.properties.signal_status)}
          />
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
      ["get", "signal_status"],
      "DESIGN",
      "#7570b3",
      "CONSTRUCTION",
      "#d95f02",
      "TURNED_ON",
      "#1b9e77",
      /* other */ "#ccc",
    ],
  },
};

const FILTERS = {
  checkbox: [
    {
      key: "Ineligble",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Ineligble",
      checked: true,
    },
    {
      key: "Requested",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Requested",
      checked: true,
    },
    {
      key: "Study in progress",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Study in progress",
      checked: true,
    },
    {
      key: "Not recommended",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Not recommended",
      checked: true,
    },
    {
      key: "Recommended",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Recommended",
      checked: true,
    },
    {
      key: "design",
      value: "DESIGN",
      featureProp: "signal_status",
      label: "Design",
      checked: true,
    },
    {
      key: "construction",
      value: "CONSTRUCTION",
      featureProp: "signal_status",
      label: "Construction",
      checked: true,
    },
    {
      key: "turned_on",
      value: "TURNED_ON",
      featureProp: "signal_status",
      label: "Turned On",
      checked: false,
    },
  ],
  search: {
    key: "search",
    value: "",
    featureProp: "location_name",
    label: "Search",
    placeholder: "Search by location...",
  },
};


export default function Viewer() {
  // const { data, loading, error } = useSocrata(SIGNAL_REQUESTS_QUERY);
  const data = signalData;

  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Signal Projects</h2>
          </Col>
        </Row>
        <DataMetaData resourceId={SIGNAL_REQUESTS_QUERY.resourceId} />
        <GeoList
          geojson={data}
          listItemRenderer={listItemRenderer}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
          detailsRenderer={detailsRenderer}
        />
        <Row className="mt-4 mb-2 text-primary">
          <Col>
            <h4>About the Signal Request Program</h4>
          </Col>
        </Row>
        <Row className="text-primary">
          <Col xs={12} lg={4}>
            <h5 className="text-dts-4">What am I Looking at?</h5>
            <p>
              This webpage reports the status of traffic and pedestrian signal
              requests. Every year we typically receive more than one hundred
              requests for traffic and pedestrian signals, each of which is
              evaluated and ranked for possible installation.
            </p>
            <p>
              This page shows the status of new and existing signal requests, as
              well as those locations that are currently being studied or have
              been studied but not yet constructed.
            </p>
            <p>Click here for more details about the signal request process.</p>
          </Col>
          <Col xs={12} lg={4}>
            <h5 className="text-dts-4">Evaluation and Study</h5>
            <p>
              Eligible request are assigned preliminary scores based on crash
              history, travel demand, and community context. The highest scoring
              requests are selected for study by a professional engineer, who
              makes a formal recommendation for signalization.
            </p>
          </Col>
          <Col xs={12} lg={4}>
            <h5 className="text-dts-4">Contact Us</h5>
            <p>
              To request a new traffic signal or follow-up on an existing
              request, call 3-1-1. You can also submit a traffic signal service
              request online.
            </p>
            <p>
              If you have questions about this web page or the data that powers
              it, contact transportation.data@austintexas.gov
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
