import React from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Footer from "../components/Footer";
import Link from "next/link";
import {
  FaClock,
  FaExclamationTriangle,
  FaRegClock,
  FaVideo,
  FaWrench,
} from "react-icons/fa";

const cards = {
  signal_operations: [
    {
      title: "Signal Projects",
      description:
        "Get the latest info about active and upcoming traffic signal construction",
      href: "/signal-projects",
      img: { src: "/assets/data_and_performance.jpg", alt: "DTS logo" },
      key: "signal_projects",
      icon: <FaWrench />,
    },
    {
      title: "Signal Monitor",
      description:
        "Real-time monitoring of the City's traffic signals",
      href: "/signal-monitor",
      img: null,
      key: "signal_monitor",
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Traffic Cameras",
      description:
        "View live images from the City's traffic cameras",
      href: "/traffic-cameras",
      img: null,
      key: "traffic_cameras",
      icon: <FaVideo />,
    },
    {
      title: "Signal Timing",
      description:
        "Track the progress of our annual signal re-timing work",
      href: "/signal-timing",
      img: null,
      icon: <FaClock />,
    },
  ],
  maps_resources: [
    {
      title: "Signal Assets",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/not-implemented",
      img: null,
    },
    {
      title: "Signs & Markings",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/not-implemented-2",
      img: null,
    },
    {
      title: "Preventative Maintenance",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/not-implemented-3",
      img: null,
    },
  ],
  open_data: [
    {
      title: "Shared Micromobility",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/micromobility-data",
      img: null,
    },
    {
      title: "Data Catalog",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/not-implemented-4",
      img: null,
    },
    {
      title: "City of Austin Github",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/not-implemented-5",
      img: null,
    },
  ],
};

export function CardItem({ href, title, description, icon }) {
  return (
    <Col key={href} xs={12} md={4} lg={3} className="pb-3">
      <Link className="text-primary text-decoration-none" href={href} passHref>
        <div style={{ cursor: "pointer", height: "100%" }}>
          <Card style={{ borderRadius: 15 }} className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="text-primary">
                {icon} {title}
              </Card.Title>
              <Row>
                <Col className="text-muted">{description}</Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Link>
    </Col>
  );
}

export default function Home() {
  return (
    <>
      <Container>
        <Row key="title-row">
          <Col key="spacer-1" md={3}></Col>
          <Col sm={12} md={9} lg={6} className="py-5 px-4 text-primary">
            <Image
              fluid
              src="/assets/data_and_performance.jpg"
              alt="Illustration of a green bicycle"
            />
            <p className="text-muted mt-3">
              This page has useful info, such as dashboards, maps, and misc
              other links to content that you may or may not find interesting.
              Also, we have a data catalog that you can browse.
            </p>
          </Col>
        </Row>
        <Row key="row-1" className="text-dts-4">
          <Col>
            <h3>Traffic Signal Operations</h3>
          </Col>
        </Row>
        <Row key="row-2" className="text-dts-4 mb-4">
          {cards.signal_operations.map((card) => {
            return <CardItem key={card.href} {...card} />;
          })}
        </Row>
        <Row key="row-3" className="text-dts-4">
          <Col>
            <h3>Maps & Resources</h3>
          </Col>
        </Row>
        <Row key="row-4" className="text-dts-4 mb-4">
          {cards.maps_resources.map((card) => {
            return <CardItem key={card.href}  {...card} />;
          })}
        </Row>
        <Row key="row-5" className="text-dts-4">
          <Col>
            <h3>Open Data & Code</h3>
          </Col>
        </Row>
        <Row key="row-6" className="text-dts-4 mb-4">
          {cards.open_data.map((card) => {
            return <CardItem key={card.href}  {...card} />;
          })}
        </Row>
      </Container>
      <Footer />
    </>
  );
}
