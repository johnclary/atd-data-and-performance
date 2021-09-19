import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import { useSocrata } from "../utils/socrata.js";
import { DataMetaData } from "../components/Metadata";
import { ListGroup } from "react-bootstrap";
import { TRAFFIC_CAMERAS_QUERY } from "../components/queries";

const COLORS = {
  online: "#1b9e77",
  offline: "#757575",
};

const Thumbnail = ({ camera_id }) => {
  const src = `https://atd-cctv.s3.amazonaws.com/${camera_id}.jpg`;
  return (
    <Image
      alt="Image from traffic camera"
      onError={() => {
        return <p>error</p>;
      }}
      src={src}
      fluid
    />
  );
};

// const mapOverlayConfig = {
//   titleKey: "location_name",
//   bodyKeys: [
//     { key: "ip_comm_status", label: "Status" },
//     { key: "screenshot_address", label: "Image", renderer: renderThumbnail },
//     { key: "camera_id", label: "Live feed", renderer: renderCameraURL },
//   ],
// };

const STATUS_STYLES = {
  ONLINE: {
    label: "Online",
    borderColor: COLORS.online,
    color: COLORS.online,
  },
  OFFLINE: {
    label: "Offline",
    borderColor: COLORS.offline,
    color: COLORS.offline,
  },
};

const renderCameraCommStatus = (status) => {
  if (!status || !STATUS_STYLES[status]) return "";
  const { label, ...styles } = STATUS_STYLES[status];
  return (
    <span style={styles} className="status-badge">
      {label || status}
    </span>
  );
};

const listItemRenderer = (feature) => {
  return (
    <>
      <p className="fw-bold my-0">
        <small>{feature.properties.location_name}</small>
      </p>
      <div className="d-flex w-100 justify-content-end">
        <p className="my-0">
          <small>
            {renderCameraCommStatus(feature.properties.ip_comm_status)}
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

const DetailsRenderer = (feature) => {
  const [showModal, setShowModal] = useState(false);
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
          <FlexyInfo label="Status" value={feature.properties.ip_comm_status} />
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo label="Camera ID" value={feature.properties.camera_id} />
        </ListGroup.Item>
        <ListGroup.Item>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setShowModal(!showModal)}
          >
            <Modal size="xl" animation={true} show={showModal} keyboard={false}>
              <Modal.Header closeButton></Modal.Header>
              <Modal.Body>
                <Row className="justify-content-center">
                  <Col xs={12} className="text-center">
                    <Thumbnail camera_id={feature.properties.camera_id} />
                  </Col>
                </Row>
              </Modal.Body>
            </Modal>
            <Thumbnail camera_id={feature.properties.camera_id} />
          </div>
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
      ["get", "ip_comm_status"],
      "ONLINE",
      COLORS.online,
      /* other */ COLORS.offline,
    ],
  },
};

const FILTERS = {
  checkbox: [
    {
      key: "online",
      value: "ONLINE",
      featureProp: "ip_comm_status",
      label: "Online",
      checked: true,
    },
    {
      key: "offline",
      value: "OFFLINE",
      featureProp: "ip_comm_status",
      label: "Offline",
      checked: true,
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
  const { data, loading, error } = useSocrata(TRAFFIC_CAMERAS_QUERY);
  if (loading) return <p>Loading...</p>
  if (error || !data) return <p>{error?.message || "something went wrong"}</p>
  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Traffic Cameras</h2>
          </Col>
        </Row>
        <GeoList
          geojson={data}
          listItemRenderer={listItemRenderer}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
          detailsRenderer={DetailsRenderer}
        />
      </Container>
      <Footer />
    </>
  );
}
