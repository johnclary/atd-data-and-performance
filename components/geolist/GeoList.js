import React, { useRef, useState } from "react";
import { Row, Col, Modal, Button } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { FaTimes } from "react-icons/fa";
import List from "./List";
import Map from "./Map";
import ListSearch from "./ListSearch";
import ListItemDetails from "./ListItemDetails";
import {
  easeToPointFeature,
  fitFeatureBounds,
  useFilteredGeojson,
  useSelectedFeatureEffect,
  useConditionalOverflow,
} from "./helpers";
/*
  GeoList is an interactive map-table component that can be configured to display a geojson FeatureCollection
  of point features. You feed it geojson data and a few configuration objects, and it presents a side-by-side
  table and map with shared states. 

  The component is responsive. The map will be hidden at Bootstrap's xs, sm, and md breakpoints and
  rendered in a full-screen modal when a table row is clicked or the "Show map" button is toggled.

  Things that can be customized:
  - map layer styles
  - the map "overlay" that displays information about a clicked table row or map feature
  - the appearance and formatting of values styled within the table
  - the table's keyword search and optional checkbox filters

  Constraints:
  - Only one layer can be rendered over the basemap
  - Only `Point` or `Multipoint` feature types can be rendered
  - The UX will not be great if you opt to render more than two or three table columns. Use the map overlay
    to display additional data.
*/

/**
 * A fullscreen modal into which the map is rendered.
 *
 * Note that the modal's visibility is toggled via a combination of display properties: the `show`
 * prop is static (`true``). This prevents the component from unmounting when it is "closed", and
 * would otherwise require mapbox GL to re-load a new map instance every time the modal is made
 * visible.
 *
 **/
function MapModal({ showMap, setShowMap, children }) {
  const handleClose = () => setShowMap(false);
  return (
    <>
      <Modal
        fullscreen
        animation={false}
        show={true}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        className={!showMap ? "d-none" : ""}
        backdropClassName={!showMap ? "d-none" : ""}
      >
        <Modal.Body className="p-0">{children}</Modal.Body>
      </Modal>
    </>
  );
}

export default function GeoList({
  geojson,
  listItemRenderer,
  layerStyle,
  filterDefs,
  selectedFeatureEffect,
  detailsRenderer,
  getPopupContent,
}) {
  const [showMap, setShowMap] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filteredGeosjon, filters, setFilters] = useFilteredGeojson({
    geojson,
    filterDefs,
  });
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useSelectedFeatureEffect(
    mapRef,
    layerStyle.id,
    selectedFeature,
    selectedFeatureEffect
  );

  /**
   * repaint the map after a brief delay to allow the DOM to catchup
   **/
  const delayedRepaintMap = () => {
    setTimeout(() => {
      mapRef?.current?.resize();
    }, 100);
  };

  // bootstrap `md` and lower
  const isSmallScreen = useMediaQuery(
    { query: "(max-width: 991px)" },
    undefined,
    () => delayedRepaintMap(mapRef.current)
  );

  const onFeatureClick = (e) => {
    const clickedFeature = e.features[0];
    setSelectedFeature(clickedFeature);
  };

  const onRowClick = (feature) => {
    if (feature) {
      if (feature.geometry.type === "Point") {
        easeToPointFeature(mapRef.current, feature);
      } else if (feature.geometry.type === "MultiPoint") {
        fitFeatureBounds(mapRef.current, feature);
      } else {
        console.error(
          `Cannot zoom to unspported geometry type: ${feature.geomtery.type}`
        );
      }
    } else {
      setSelectedFeature(null);
    }
    setSelectedFeature(feature);
    delayedRepaintMap(mapRef.current);
  };

  useConditionalOverflow(isSmallScreen, showMap);

  return (
    <>
      <Row>
        <Col xs={12} lg={4}>
          <Row style={{ height: "75vh", overflow: "hidden" }}>
            <Col>
              {selectedFeature && (
                <Row style={{ height: "75vh", overflow: "auto" }}>
                  <ListItemDetails
                    feature={selectedFeature}
                    detailsRenderer={detailsRenderer}
                    setSelectedFeature={setSelectedFeature}
                    setShowMap={setShowMap}
                    isSmallScreen={isSmallScreen}
                    delayedRepaintMap={delayedRepaintMap}
                  />
                </Row>
              )}
              <div className={selectedFeature ? "d-none" : ""}>
                <Row>
                  <Col>
                    <ListSearch
                      setSelectedFeature={setSelectedFeature}
                      filters={filters}
                      setFilters={setFilters}
                    />
                  </Col>
                </Row>
                <Row style={{ height: "75vh", overflow: "auto" }}>
                  <Col className="pb-5">
                    <List
                      features={filteredGeosjon?.features}
                      onRowClick={onRowClick}
                      listItemRenderer={listItemRenderer}
                      setSelectedFeature={setSelectedFeature}
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Col>
        {!isSmallScreen && (
          <Col>
            <Row style={{ height: "75vh" }}>
              <Col>
                <Map
                  geojson={filteredGeosjon}
                  layerStyle={layerStyle}
                  mapContainerRef={mapContainerRef}
                  mapRef={mapRef}
                  selectedFeature={selectedFeature}
                  setSelectedFeature={setSelectedFeature}
                  onFeatureClick={onFeatureClick}
                  getPopupContent={getPopupContent}
                />
              </Col>
            </Row>
          </Col>
        )}
        {isSmallScreen && (
          <MapModal showMap={showMap} setShowMap={setShowMap}>
            <Button
              className="btn-primary"
              style={{
                zIndex: 99999999,
                position: "absolute",
                top: 0,
                right: 0,
                margin: 5,
              }}
              onClick={() => {
                setShowMap(false);
              }}
            >
              <FaTimes /> Close
            </Button>
            <Map
              geojson={filteredGeosjon}
              layerStyle={layerStyle}
              mapContainerRef={mapContainerRef}
              mapRef={mapRef}
              selectedFeature={selectedFeature}
              setSelectedFeature={setSelectedFeature}
              onFeatureClick={onFeatureClick}
              getPopupContent={getPopupContent}
            />
          </MapModal>
        )}
      </Row>
    </>
  );
}
