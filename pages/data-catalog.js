import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import useKnack from "../utils/knack.js";

const URL = `https://api.knack.com/v1/pages/scene_22/views/view_37/records`;

const HEADERS = {
  "X-Knack-Application-Id": "595d00ebd315cc4cb98daff4",
  "X-Knack-REST-API-KEY": "knack",
};

export default function Viewer() {
  const { data, loading, error } = useKnack({ url: URL, headers: HEADERS });
  if (loading) return <p>loading...</p>;
  if (error) return <p>errrrror!</p>;
  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Data Catalog</h2>
          </Col>
        </Row>
        {data.records.map((record) => {
          return <p key={record.id}>{record.field_48}</p>;
        })}
      </Container>
      <Footer />
    </>
  );
}
