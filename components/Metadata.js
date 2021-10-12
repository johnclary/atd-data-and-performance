import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useSocrataMetadata } from "../utils/socrata";
import { FaDownload } from "react-icons/fa";

export default function DataMetaData({ resourceId }) {
  const { data, loading, error } = useSocrataMetadata({ resourceId });
  if (loading) {
    return <span>Loading...</span>;
  }

  // todo: be better
  if (error || !data) return <p>{error?.message || "something went wrong"}</p>;

  const updatedAt = new Date(data.rowsUpdatedAt * 1000).toLocaleString();
  const downloadUrl = `https://data.austintexas.gov/dataset/Traffic-Signals-and-Pedestrian-Signals/${resourceId}`;

  return (
    <Row>
      <Col xs={12}>
        <p className="text-center text-muted">
          <small>
            {`Updated at ${updatedAt}`}
            <span className="mx-2">|</span>
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              Data
            </a>
            <span className="mx-2">
              <FaDownload />
            </span>
          </small>
        </p>
      </Col>
    </Row>
  );
}
