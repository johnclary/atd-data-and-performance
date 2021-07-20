import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";
import Footer from "../components/Footer";
import GeoList from "../components/geolist/GeoList";
import Nav from "../components/Nav";
import useSocrata from "../utils/socrata.js";
import { TRAFFIC_CAMERAS_QUERY } from "../components/queries";

const COLORS = {
  online: "#1b9e77",
  offline: "#757575",
};

const renderCameraURL = (feature) => {
  console.log(feature);
  return (
    <a href={`http://10.66.2.64:8000/?cam_id=${feature.properties.camera_id}`}>
      View live feed (restricted access)
    </a>
  );
};

const renderThumbnail = (feature) => {
  const url = feature.properties.screenshot_address;
  return <Image onError={()=>{return <p>error</p>}} src={url} fluid />;
};

const mapOverlayConfig = {
  titleKey: "location_name",
  bodyKeys: [
    { key: "ip_comm_status", label: "Status" },
    { key: "screenshot_address", label: "Image", renderer: renderThumbnail },
    { key: "camera_id", label: "Live feed", renderer: renderCameraURL },
  ],
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
          mapOverlayConfig={mapOverlayConfig}
        />
      </Container>
      <Footer />
    </>
  );
}
