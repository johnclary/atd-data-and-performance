import React from "react";
import { Row, Col, Container } from "react-bootstrap";

export default function Footer() {
  return (
    <Container fluid className="bg-primary mt-4">
      <Row className="text-white py-3">
        <div className="d-flex flex-wrap justify-content-center">
          <Col md={6} lg={4}>
            <Row>
              <Col className="text-center">
                <h5>City of Austin Transportation Department</h5>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="d-flex flex-wrap justify-content-between">
                  <div className="mx-2">Data</div>
                  <div className="mx-2">Code</div>
                  <div className="mx-2">About</div>
                  <div className="mx-2">Contact</div>
                  <div className="mx-2">Disclaimer</div>
                </div>
              </Col>
            </Row>
          </Col>
        </div>
      </Row>
    </Container>
  );
}
