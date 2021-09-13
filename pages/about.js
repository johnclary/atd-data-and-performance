import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

export default function Viewer() {
  return (
    <>
      <Nav />
      <Container fluid>
        <Row key="title">
          <Col>
            <h1 className="text-primary">About</h1>
          </Col>
        </Row>
        <Row key="about">
          <Col xs={12} md={7}>
            <h3 className="text-primary mt-3">
              Welcome to the Austin Transportation Data & Performance Hub!
            </h3>
            <p>
              This site is provided by the{" "}
              <a
                href="https://www.austintexas.gov/department/transportation"
                targe="_blank"
              >
                Austin Transportation Department
              </a>{" "}
              to curate access to performance dashboards and public datasets.
            </p>
            <h3 className="text-primary mt-5">
              This source code is open!
            </h3>
            <p>
              Here's some more info. Here's some more info. Here's some more
              info. Here's some more info. Here's some more info. Here's some
              more info. Here's some more info. Here's some more info.
            </p>
            <h3 className="text-primary mt-5">
              It has been created by Data & Technology Services!
            </h3>
            <p>
              Here's some more info. Here's some more info. Here's some more
              info. Here's some more info. Here's some more info. Here's some
              more info. Here's some more info. Here's some more info.
            </p>
            <p>
              Here's some more info. Here's some more info. Here's some more
              info. Here's some more info. Here's some more info. Here's some
              more info. Here's some more info. Here's some more info.
            </p>
            <p>
              Here's some more info. Here's some more info. Here's some more
              info. Here's some more info. Here's some more info. Here's some
              more info. Here's some more info. Here's some more info.
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
