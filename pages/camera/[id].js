import React from "react";
import { useRouter } from 'next/router'
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";

export default function CameraImage() {
  const router = useRouter()
  const camera_id = router.query.id
  const url = `https://atd-cctv.s3.amazonaws.com/${camera_id}.jpg`;
  return (
    <Container fluid className="p-0 m-0">
      <Row>
        <Col xs={12}>
          <Image
            alt="Image from traffic camera"
            onError={() => {
              return <p>error</p>;
            }}
            src={url}
            fluid
          />
        </Col>
      </Row>
    </Container>
  );
}
