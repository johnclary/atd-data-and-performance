// import React, { useState, useEffect } from "react";
// import Col from "react-bootstrap/Col";
// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import ListGroup from "react-bootstrap/ListGroup";
// import Footer from "../components/Footer";
// import GeoList from "../components/geolist/GeoList";
// import Nav from "../components/Nav";
// import { useSocrata } from "../utils/socrata.js";
// import { DataMetaData } from "../components/Metadata";
// import {
//   SIGNAL_STUDIES_QUERY,
//   SIGNAL_PROJECTS_QUERY,
//   SIGNALS_QUERY,
//   SIGNAL_LOCATIONS_QUERY
// } from "../components/queries";

// const STATUS_STYLES = {
//   DESIGN: {
//     label: "Design",
//     borderColor: "#7570b3",
//     color: "#7570b3",
//   },
//   CONSTRUCTION: {
//     label: "Construction",
//     borderColor: "#d95f02",
//     color: "#d95f02",
//   },
//   TURNED_ON: {
//     label: "Turned On",
//     borderColor: "#1b9e77",
//     color: "#1b9e77",
//   },
//   "READY FOR CONSTRUCTION": {
//     label: "Ready for Construction",
//     borderColor: "#1b9e77",
//     color: "#1b9e77",
//   },
// };

// const renderSignalStatus = (status) => {
//   if (!status || !STATUS_STYLES[status]) return "";
//   const { label, ...styles } = STATUS_STYLES[status];
//   return (
//     <span style={styles} className="status-badge">
//       {label || status}
//     </span>
//   );
// };

// const renderSignalType = (type) => {
//   switch (type) {
//     case "TRAFFIC":
//       return "Traffic signal";
//     case "PHB":
//       return "Pedestrian signal";
//     default:
//       return "";
//   }
// };

// const listItemRenderer = (feature) => {
//   return (
//     <>
//       <p className="fw-bold my-0">
//         <small>{feature.properties.location_name}</small>
//       </p>
//       <div className="d-flex w-100 justify-content-between">
//         <p className="my-0">
//           <small>{feature.properties.type}</small>
//         </p>
//         <p className="my-0 text-nowrap">
//           <small>
//             <small>{feature.properties.status}</small>
//           </small>
//         </p>
//       </div>
//     </>
//   );
// };

// const FlexyInfo = ({ label, value }) => {
//   return (
//     <div className="d-flex w-100 justify-content-between">
//       <p className="fw-bold my-0">
//         <small>{label}</small>
//       </p>
//       <p className="my-0">
//         <small>{value}</small>
//       </p>
//     </div>
//   );
// };

// const detailsRenderer = (feature) => {
//   return (
//     <Col>
//       <ListGroup variant="flush">
//         <ListGroup.Item>
//           <span className="fs-4 fw-bold me-2">
//             {feature.properties.location_name}
//           </span>
//           <span className="text-muted fst-italic">
//             {feature.properties.type}
//           </span>
//         </ListGroup.Item>
//         <ListGroup.Item>
//           <FlexyInfo label="Status" value={feature.properties.status} />
//         </ListGroup.Item>
//       </ListGroup>
//     </Col>
//   );
// };

// const POINT_LAYER_STYLE = {
//   id: "points",
// };

// const FILTERS = {
//   checkbox: [
//     {
//       key: "study",
//       value: "study",
//       featureProp: "type",
//       label: "Study",
//       checked: true,
//     },
//     {
//       key: "signal",
//       value: "signal",
//       featureProp: "type",
//       label: "signal",
//       checked: true,
//     },
//   ],
//   search: {
//     key: "search",
//     value: "",
//     featureProp: "location_name",
//     label: "Search",
//     placeholder: "Search by location...",
//   },
// };

// const useWhereExpression = (projects) => {
//   const [expr, setExpr] = useState(null);
//   useEffect(() => {
//     if (!projects) {
//       return;
//     }
//     const ids = projects
//       // parse comma-sep string of ids
//       .map((project) => project.signal_id?.split(","))
//       // flatten - js is cool :)
//       .flat()
//       // exclude null/empty
//       .filter((id) => id)
//       // convert ID
//       .map((id) => parseInt(id));

//     const whereIds = ids.length > 0 ? `(${[...new Set(ids)].join(",")})` : null;
//     setExpr({ key: "where", value: `signal_id in ${whereIds}` });
//   }, [projects]);
//   return expr;
// };

// const useSignalsQuery = (query, whereExpr) => {
//   const [signalQuery, setSignalQuery] = useState(null);

//   useEffect(() => {
//     if (!whereExpr) {
//       return;
//     }
//     let q = { ...query };
//     q.args = [...q.args];
//     q.args.push(whereExpr);
//     setSignalQuery(q);
//   }, [query, whereExpr]);

//   return signalQuery || query;
// };

// const makeFeature = (properties, geometry) => {
//   return { type: "Feature", properties: properties, geometry: geometry };
// };


// const useUnifiedData = ({ dataStudies, dataProjects, dataSignals, dataLocations }) => {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     if (!dataStudies?.features || !dataProjects || !dataSignals?.features || !dataLocations?.features) {
//       return;
//     }
//     const studies = dataStudies.features.map((study) => {
//       let properties = { type: "study" };
//       properties.status = study.properties.study_outcome
//         ? study.properties.study_outcome
//         : study.properties.study_status;
//       properties.location_name = study.properties.location_name;
//       return makeFeature(properties, study.geometry);
//     });

//     const signals = dataSignals.features.map((signal) => {
//       let properties = { type: "signal" };
//       properties.status = signal.properties.signal_status;
//       properties.location_name = signal.properties.location_name;
//       return makeFeature(properties, signal.geometry);
//     });

//     setData([...signals, ...studies]);
//   }, [dataSignals.features, dataProjects, dataStudies]);
//   return data;
// };

// export default function Viewer() {
//   const {
//     data: dataStudies,
//     loading: loadingStudies,
//     error: errorStudies,
//   } = useSocrata(SIGNAL_STUDIES_QUERY);

//   const {
//     data: dataProjects,
//     loading: loadingProjects,
//     error: errorProjects,
//   } = useSocrata(SIGNAL_PROJECTS_QUERY);

//   const whereSignalIds = useWhereExpression(dataProjects);

//   const signalQuery = useSignalsQuery(SIGNALS_QUERY, whereSignalIds);

//   const {
//     data: dataSignals,
//     loading: loadingSignals,
//     error: errorSignals,
//   } = useSocrata(signalQuery);

//   const {
//     data: dataLocations,
//     loading: loadingLocations,
//     error: errorLocations,
//   } = useSocrata(SIGNAL_LOCATIONS_QUERY);

//   const data = useUnifiedData({ dataStudies, dataProjects, dataSignals, dataLocations });

//   if (loadingProjects || loadingStudies || loadingSignals) {
//     return <p>loading!</p>;
//   }

//   if (!data) {
//     return <p>nada</p>;
//   }
//   console.log("render")
//   return (
//     <>
//       <Nav />
//       <Container fluid>
//         <Row>
//           <Col>
//             <h2 className="text-primary">Signal Projects</h2>
//           </Col>
//         </Row>
//         <DataMetaData resourceId={SIGNAL_STUDIES_QUERY.resourceId} />
//         <GeoList
//           geojson={{ type: "FeatureCollection", features: data }}
//           listItemRenderer={listItemRenderer}
//           filterDefs={FILTERS}
//           layerStyle={POINT_LAYER_STYLE}
//           detailsRenderer={detailsRenderer}
//         />
//         <Row className="mt-4 mb-2 text-primary">
//           <Col>
//             <h4>About the Signal Request Program</h4>
//           </Col>
//         </Row>
//         <Row className="text-primary">
//           <Col xs={12} lg={4}>
//             <h5 className="text-dts-4">What am I Looking at?</h5>
//             <p>
//               This webpage reports the status of traffic and pedestrian signal
//               requests. Every year we typically receive more than one hundred
//               requests for traffic and pedestrian signals, each of which is
//               evaluated and ranked for possible installation.
//             </p>
//             <p>
//               This page shows the status of new and existing signal requests, as
//               well as those locations that are currently being studied or have
//               been studied but not yet constructed.
//             </p>
//             <p>Click here for more details about the signal request process.</p>
//           </Col>
//           <Col xs={12} lg={4}>
//             <h5 className="text-dts-4">Evaluation and Study</h5>
//             <p>
//               Eligible request are assigned preliminary scores based on crash
//               history, travel demand, and community context. The highest scoring
//               requests are selected for study by a professional engineer, who
//               makes a formal recommendation for signalization.
//             </p>
//           </Col>
//           <Col xs={12} lg={4}>
//             <h5 className="text-dts-4">Contact Us</h5>
//             <p>
//               To request a new traffic signal or follow-up on an existing
//               request, call 3-1-1. You can also submit a traffic signal service
//               request online.
//             </p>
//             <p>
//               If you have questions about this web page or the data that powers
//               it, contact transportation.data@austintexas.gov
//             </p>
//           </Col>
//         </Row>
//       </Container>
//       <Footer />
//     </>
//   );
// }
