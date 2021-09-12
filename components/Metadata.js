import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useSocrataMetadata } from "../utils/socrata";
import { FaDownload } from "react-icons/fa";

export const DataMetaData = ({ resourceId }) => {
  const { data, loading, error } = useSocrataMetadata({ resourceId });
  if (loading) {
    return <span>Loading...</span>;
  }
  const updatedAt = new Date(data.rowsUpdatedAt * 1000).toLocaleString();
  const downloadUrl = `https://data.austintexas.gov/dataset/Traffic-Signals-and-Pedestrian-Signals/${resourceId}`;
  return (
    <Row>
      <Col xs={12}>
        <p className="text-center text-muted">
          <small>
            {`Updated at ${updatedAt}`}
            <span className="mx-2">|</span>
            <a href={downloadUrl} target="_blank">
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
};
