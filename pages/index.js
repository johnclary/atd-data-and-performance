import React from "react";
import Head from "next/head";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Footer from "../components/Footer";
import { IconSeparator } from "../components/Nav";
import {
  FaClock,
  FaExclamationTriangle,
  FaVideo,
  FaWrench,
} from "react-icons/fa";

// image size: 960 x 491px
const cards = [
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
    description: "Real-time monitoring of the City's traffic signals",
    href: "/signal-monitor",
    img: null,
    key: "signal_monitor",
    icon: <FaExclamationTriangle />,
  },
  {
    title: "Traffic Cameras",
    description: "Live images from the City's traffic cameras",
    href: "/traffic-cameras",
    img: {src: "/assets/cctv.jpg", alt:"Traffic camera thumbnail"},
    key: "traffic_cameras",
    icon: <FaVideo />,
  },
  {
    title: "Signal Timing",
    description: "Track the progress of our annual signal re-timing work",
    href: "/signal-timing",
    img: {src: "/assets/signal-timing.jpg", alt:"Signal timing dashboard"},
    icon: <FaClock />,
  },

  {
    title: "Signal Assets",
    description:
      "Comprehensive map of traffig signal assets, including sensors, vehicle detectors, and school beacons.",
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
    href: "/data-catalog",
    img: null,
  },
  {
    title: "City of Austin Github",
    description:
      "Info about signal requests where you can search and browse info.",
    href: "/not-implemented-5",
    img: null,
  },
];

export function CardItem({ href, title, description, icon, img }) {
  return (
    <Col key={href} xs={12} md={4} lg={3} className="pb-3">
      <Link className="text-primary text-decoration-none" href={href} passHref>
        <div style={{ cursor: "pointer", height: "100%" }}>
          <Card style={{ borderRadius: 15 }} className="h-100 shadow-sm">
            {img && <Card.Img variant="top" alt={img.alt} src={img.src} />}
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
      <Head>
        <title>Austin Transportation Data and Performance Hub</title>
        <meta
          property="og:title"
          content="Austin Transportation Data and Performance Hub"
          key="title"
        />
      </Head>
      <Container>
        <Row key="title-row" className="justify-content-center">
          <Col sm={12} md={6} lg={5} className="pt-5 text-primary">
            <Image
              fluid
              src="/assets/data_and_performance.jpg"
              alt="Performance hub logo"
            />
            <IconSeparator />
          </Col>
        </Row>
        <Row key="subtitle" className="justify-content-center mb-2">
          <Col sm={12} className="text-center">
            <p className="text-muted">
              This site is provided by the{" "}
              <a
                href="https://www.austintexas.gov/department/transportation"
                targe="_blank"
              >
                Austin Transportation Department
              </a>{" "}
              to curate access to performance dashboards and public datasets.
            </p>
          </Col>
        </Row>
        <Row key="cards" className="text-dts-4 mb-4">
          {cards.map((card) => {
            return <CardItem key={card.href} {...card} />;
          })}
        </Row>
      </Container>
      <Footer />
    </>
  );
}
