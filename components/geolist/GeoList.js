import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Fade from "react-bootstrap/Fade";
import { BsSearch } from "react-icons/bs";
import { FaCaretDown, FaCaretUp, FaMapMarkerAlt, FaChevronLeft, FaTimes } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import List from "./List";
import Map from "./Map";
import { easeToPointFeature, fitFeatureBounds } from "./helpers";
import {
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

const CheckBoxFilters = ({ filters, setFilters }) => {
  const onChange = (filter) => {
    let currentFilters = { ...filters };
    currentFilters.checkbox.some((f) => {
      if (f.key == filter.key) {
        f.checked = !f.checked;
        return true;
      }
    });
    // force all checkboxes to be checked if none are. prevents user from enabling all, resulting in a blank map
    if (
      currentFilters.checkbox.every((f) => {
        return !f.checked;
      })
    ) {
      currentFilters.checkbox.forEach((f) => {
        f.checked = true;
      });
    }
    setFilters(currentFilters);
  };

  return (
    <Form>
      {filters.checkbox.map((f) => (
        <div key={f.key}>
          <Form.Check
            type="switch"
            id={f.key}
            label={f.label}
            checked={f.checked}
            onChange={() => onChange(f)}
            className="text-dts-primary"
          />
        </div>
      ))}
    </Form>
  );
};

/**
 * A styled button for the filter toggle. All props are passed to the
 * react-bootstrap Button component
 **/
const FilterButton = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Button
      id="filter-button-toggle"
      {...props}
      onClick={() => {
        props.onClick();
        setIsExpanded(!isExpanded);
      }}
    >
      Filter
      {!isExpanded ? <FaCaretDown /> : <FaCaretUp />}
    </Button>
  );
};

const TableSearch = ({ filters, setFilters, setSelectedFeature }) => {
  const handleChange = (e) => {
    // remove the selected feature when typing in search box
    // ensures map marker is removed as features are filtered
    setSelectedFeature(null);
    let currentFilters = { ...filters };
    currentFilters.search.value = e.target.value;
    setFilters(currentFilters);
  };
  return (
    <>
      <Navbar expand="xs" className="py-0">
        <Container fluid className="px-0">
          <InputGroup className="mb-1">
            <InputGroup.Text id="basic-addon1">
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              size="sm"
              key={filters.search.key}
              name={filters.search.label}
              type="search"
              placeholder={filters.search.placeholder}
              onChange={handleChange}
            />
            {filters.checkbox && (
              <Navbar.Toggle
                as={FilterButton}
                aria-controls="basic-navbar-nav"
              />
            )}
          </InputGroup>

          {filters.checkbox && (
            <Navbar.Collapse timeout={100} id="basic-navbar-nav">
              <CheckBoxFilters filters={filters} setFilters={setFilters} />
            </Navbar.Collapse>
          )}
        </Container>
      </Navbar>
    </>
  );
};

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

const ListItemDetails = ({
  detailsRenderer,
  feature,
  setSelectedFeature,
  setShowMap,
  isSmallScreen,
  delayedRepaintMap,
}) => {
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
          <Col>
            <Button size="sm" variant="outline-dts-4" onClick={() => setSelectedFeature(null)}>
              <FaChevronLeft/> Back to list
            </Button>
          </Col>
          {isSmallScreen && (
            <Col xs="auto">
              <Button
                variant="outline-dts-4"
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
};

export default function GeoList({
  geojson,
  listItemRenderer,
  layerStyle,
  filterDefs,
  selectedFeatureEffect,
  detailsRenderer,
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
                    <TableSearch
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
                      selectedFeature={selectedFeature}
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
                />
              </Col>
            </Row>
          </Col>
        )}
        {isSmallScreen && (
          <MapModal showMap={showMap} setShowMap={setShowMap}>
            <Button
              className="btn-dts-4"
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
              <FaTimes/> Close
            </Button>
            <Map
              geojson={filteredGeosjon}
              layerStyle={layerStyle}
              mapContainerRef={mapContainerRef}
              mapRef={mapRef}
              selectedFeature={selectedFeature}
              setSelectedFeature={setSelectedFeature}
              onFeatureClick={onFeatureClick}
            />
          </MapModal>
        )}
      </Row>
    </>
  );
}
