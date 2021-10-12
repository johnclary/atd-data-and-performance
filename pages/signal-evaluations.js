import React from "react";
import Script from "next/script";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Spinner from "../components/Spinner";
import Nav from "../components/Nav";
import { useSocrata } from "../utils/socrata.js";
import DataMetaData from "../components/Metadata";
import { SIGNAL_EVALUATIONS_QUERY } from "../components/queries";
import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalculator,
  FaDollarSign,
  FaCheckSquare,
  FaTools,
  FaRegTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

const STATUS_DEFS = [
  {
    location_statuses: ["archived", "ineligible"],
    status_simple: "Closed",
    checked: true,
    icon: FaRegTimesCircle,
  },
  {
    location_statuses: ["recently received", "evaluated"],
    status_simple: "Identification",
    checked: true,
    icon: FaMapMarkerAlt,
  },
  {
    location_statuses: ["study in progress", "selected for study"],
    status_simple: "Evaluation",
    checked: true,
    icon: FaCalculator,
  },
  {
    location_statuses: ["not recommended"],
    status_simple: "Not recommended",
    checked: true,
    icon: FaRegTimesCircle,
  },
  {
    location_statuses: ["recommended (needs funding)"],
    status_simple: "Needs funding",
    checked: true,
    icon: FaDollarSign,
  },
  {
    location_statuses: [
      "recommended (funded)",
      "ready for design",
      "design",
      "construction",
      "ready for construction",
    ],
    status_simple: "In development",
    checked: true,
    icon: FaTools,
  },
  {
    location_statuses: "turned_on",
    status_simple: "Built / Turned on",
    checked: false,
    icon: FaCheckCircle,
  },
];

const POINT_LAYER_STYLE = {
  id: "points",
  paint: {
    "circle-color": "#7B76B5",
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 1,
  },
};

const FILTERS = {
  search: {
    key: "search",
    value: "",
    featureProp: "location_name",
    label: "Search",
    placeholder: "Search by location...",
  },
};

const FlexyInfo = ({ label, value }) => {
  return (
    <div className="d-flex w-100 justify-content-between text-dts-dark-gray">
      <p className="my-0">
        <small>{label}</small>
      </p>
      <p className="my-0">
        <small>{value}</small>
      </p>
    </div>
  );
};

const InfoRow = () => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <FaMapMarkerAlt className="me-1 text-secondary" />
      Identification
      <FaArrowRight style={{ color: "darkgray" }} className="mx-3" />
      <FaCalculator className="me-1 text-secondary" />
      Evaluation
      <FaArrowRight style={{ color: "darkgray" }} className="mx-3" />
      <FaCheckSquare className="me-1 text-secondary" />
      Recommendation
      <FaArrowRight style={{ color: "darkgray" }} className="mx-3" />
      <FaDollarSign className="me-1 text-secondary" />
      Funding
      <FaArrowRight style={{ color: "darkgray" }} className="mx-3" />
      <FaTools className="me-1 text-secondary" />
      Construction
    </div>
  );
};

const DetailsRenderer = (feature) => {
  return (
    <Col>
      <ListGroup variant="flush">
        <ListGroup.Item className="text-dts-dark-gray">
          <span className="fs-5 fw-bold me-2">
            {feature.properties.location_name}
          </span>
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo
            label="Status"
            value={feature.properties.location_status}
          />
        </ListGroup.Item>
      </ListGroup>
    </Col>
  );
};

const listItemRenderer = (feature) => {
  const statusDefMatch = STATUS_DEFS.find(
    (statusDef) =>
      statusDef.status_simple === feature.properties.location_status_simple
  );

  const Icon =
    statusDefMatch && statusDefMatch.icon ? statusDefMatch.icon : null;

  return (
    <>
      <p className="fw-bold my-0">
        <small>{feature.properties.location_name}</small>
      </p>
      <div className="d-flex w-100 justify-content-end align-items-center">
        {Icon && <Icon className="me-1" />}
        <span>{feature.properties.location_status_simple}</span>
      </div>
    </>
  );
};

const setSimpleLocationStatus = (features, statusDefs) => {
  features.forEach((feature) => {
    const status = feature.properties.location_status.toLowerCase();
    // should never happen because the socrata dataset's source knack container excludes records with null statuses
    if (!status) return;
    const statusDefMatch = statusDefs.find((statusDef) =>
      statusDef.location_statuses.includes(status.toLowerCase())
    );
    // should never happen - indicates a status value was modified in source Knack records
    if (!statusDefMatch) return;
    feature.properties.location_status_simple = statusDefMatch.status_simple;
  });
};

const getCheckboxFilterDefs = (statusDefs) => {
  return statusDefs.map((statusDef) => {
    return {
      key: statusDef.status_simple,
      value: statusDef.status_simple,
      featureProp: "location_status_simple",
      label: statusDef.status_simple,
      checked: statusDef.checked,
    };
  });
};

export default function Viewer() {
  const { data, loading, error } = useSocrata(SIGNAL_EVALUATIONS_QUERY);
  if (loading) return <Spinner />;
  if (error || !data) return <p>{error?.message || "something went wrong"}</p>;
  setSimpleLocationStatus(data.features, STATUS_DEFS);

  const checkboxFilters = getCheckboxFilterDefs(STATUS_DEFS);

  return (
    <>
      <Script
        src="https://kit.fontawesome.com/27736568c7.js"
        crossorigin="anonymous"
      ></Script>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Traffic Signal Evaluations</h2>
          </Col>
        </Row>
        <Row className="my-4">
          <Col>
            <InfoRow />
          </Col>
        </Row>
        <GeoList
          geojson={data}
          listItemRenderer={listItemRenderer}
          filterDefs={{ search: FILTERS.search, checkbox: checkboxFilters }}
          layerStyle={POINT_LAYER_STYLE}
          detailsRenderer={DetailsRenderer}
          getPopupContent={(feature) => feature.properties.location_name}
        />
        <DataMetaData resourceId={SIGNAL_EVALUATIONS_QUERY.resourceId} />
        <Row>
          <Col>
            <h4>How it works</h4>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={2}>
            <h6>
              <FaMapMarkerAlt className="me-1 text-secondary" /> Identification
            </h6>
            <p>
              A location is identified for posssible signalization. The location
              may have been requested by a resident (via 311), identified by
              City staff, or identified through the permitting process for a
              private development.
            </p>
          </Col>
          <Col xs={3}>
            <h6>
              <FaCalculator className="me-1 text-secondary" /> Evaluation
            </h6>
            <p>
              All locations undergo an evaluation process, which consists of an
              initial assessment which considers crash history, traffic volumes,
              pedestrian activity, equity, and other factors in the built
              environment. A subset of these locations are selected for an
              engineering study, in which a Professional Engineer conducts an
              in-depth analysis of the location to determine if signalization is
              warranted.
            </p>
          </Col>
          <Col xs={2}>
            <h6>
              <FaCheckSquare className="me-1 text-secondary" /> Recommendation
            </h6>
            <p>
              The evaluation process concludes with an engineer&apos;s recommendation
              to construct a traffic or pedestrain signal. If signalization is
              recommended, the City may proceed to construct a signal at the
              location.
            </p>
          </Col>
          <Col xs={2}>
            <h6>
              <FaDollarSign className="me-1 text-secondary" />
              Funding
            </h6>
            <p>
              The City funds traffic signal construction through a variety of
              sources, including its operating budget, grants, and private
              developers (as may be required through the development review
              processs).
            </p>
          </Col>
          <Col xs={3}>
            <h6>
              <FaTools className="me-1 text-secondary" />
              Construction
            </h6>
            <p>
              When a location has been recommended for signalization and funding
              has been secured, the Austin Transportation Department oversees
              the construction of a new signal. Time to completion varies based
              on staff resources, design constraints, as well as conflicting
              roadway projects at the signal location. You can track the status
              of signal construction projects with <a>this dashboard</a>.
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
