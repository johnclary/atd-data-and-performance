import React, { useState } from "react";
import { Container, Row, Col, Modal, ListGroup } from "react-bootstrap";
import Spinner from "../../components/Spinner";
import Footer from "../../components/Footer";
import GeoList from "../../components/geolist/GeoList";
import Nav from "../../components/Nav";
import { useSocrata } from "../../utils/socrata.js";
import DataMetaData from "../../components/Metadata";
import Thumbnail from "./Thumbnail";
import { TRAFFIC_CAMERAS_QUERY } from "../../components/queries";

const COLORS = {
  online: "#1b9e77",
  offline: "#757575",
};

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

const better = (str) => {
  let [name, landmark] = str.split("(");
  return `${name}`;
};

const DetailsRenderer = (feature) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <Col>
      <ListGroup variant="flush">
        <ListGroup.Item className="text-dts-dark-gray">
          <span className="fs-5 fw-bold me-2">
            {better(feature.properties.location_name)}
          </span>
        </ListGroup.Item>
        <ListGroup.Item>
          <FlexyInfo
            label="Status"
            value={renderCameraCommStatus(feature.properties.ip_comm_status)}
          />
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
        <ListGroup.Item>
          <small>
            <a
              href={`http://10.66.2.64:8000/?cam_id=${feature.properties.camera_id}`}
              target="_blank"
              rel="noreferrer"
            >
              Live stream
            </a>{" "}
            (Restricted Access)
          </small>
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
  const { data, loading, error } = useSocrata(TRAFFIC_CAMERAS_QUERY);
  if (loading) return <Spinner />;
  if (error || !data) return <p>{error?.message || "something went wrong"}</p>;
  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Traffic Cameras</h2>
          </Col>
        </Row>
        <DataMetaData resourceId={TRAFFIC_CAMERAS_QUERY.resourceId} />
        <GeoList
          geojson={data}
          listItemRenderer={listItemRenderer}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
          detailsRenderer={DetailsRenderer}
          getPopupContent={(feature) => feature.properties.location_name}
        />
      </Container>
      <Footer />
    </>
  );
}
