import React, { useEffect, useState } from "react";
import { Row, Col, Button, Fade, CloseButton } from "react-bootstrap";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function ListItemDetails({
  detailsRenderer,
  feature,
  setSelectedFeature,
  setShowMap,
  isSmallScreen,
  delayedRepaintMap,
}) {
  const [open, setIsOpen] = useState(false);

  // Delay fade effect to ensure it's visibile
  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 100);
  }, []);

  return (
    <Fade in={open}>
      <Col>
        <Row>
          <Col className="text-end">
            <CloseButton
              className=""
              onClick={() => setSelectedFeature(null)}
            />
          </Col>
          {isSmallScreen && (
            <Col xs="auto">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setShowMap(true);
                  delayedRepaintMap();
                }}
              >
                <FaMapMarkerAlt /> Map
              </Button>
            </Col>
          )}
        </Row>
        <Row>{detailsRenderer(feature)}</Row>
      </Col>
    </Fade>
  );
}
