import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Spinner from "react-bootstrap/Spinner";
import {
  Accordion,
  ListGroup,
  useAccordionButton,
  Button,
} from "react-bootstrap";
import { FaCaretDown, FaCaretUp, FaMapMarkerAlt } from "react-icons/fa";

import styles from "../../styles/Map.module.css";
// TODO: move to build environment
mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

const MAP_OPTIONS = {
  center: [-97.74, 30.28],
  zoom: 11,
  style: "mapbox://styles/mapbox/light-v10",
  maxZoom: 18,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-98.27, 30.05],
    [-97.18318, 30.49],
  ],
};

const POINT_LAYER_OPTIONS_DEFAULT = {
  id: "points",
  type: "circle",
  source: "points",
  paint: {
    "circle-radius": {
      stops: [
        [10, 5],
        [16, 15],
      ],
    },
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 2,
    "circle-stroke-opacity": 0.9,
    "circle-color": "#607d8f",
    "circle-opacity": 0.9,
  },
};

/**
 * Add a custom geojson point layer to a map and enable basic interactivity
 **/
export const addPointLayer = ({ map, layer, geojson, onFeatureClick }) => {
  /* merge paint properties separately to allow individual default paint properties
  to be overwritten */
  layer.paint = {
    ...POINT_LAYER_OPTIONS_DEFAULT.paint,
    ...(layer.paint || {}),
  };

  layer = { ...POINT_LAYER_OPTIONS_DEFAULT, ...layer };

  // note the use of `generateId` to enable mapbox feature-state methods
  map.addSource(layer.id, {
    type: "geojson",
    data: geojson,
    generateId: true,
  });

  map.addLayer(layer);

  map.on("mouseenter", layer.id, function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", layer.id, function () {
    map.getCanvas().style.cursor = "";
  });

  map.on("click", layer.id, onFeatureClick);
};

/**
 * Add a point marker to a map
 **/
const Marker = ({ map, feature }) => {
  const markerRef = useRef();

  useEffect(() => {
    const marker = new mapboxgl.Marker(markerRef)
      .setLngLat([
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
      ])
      .addTo(map);
    return () => marker.remove();
  });

  return <div ref={markerRef} />;
};

/**
 * Construct a bounding box from a multiPoint feature.
 **/
const getMultiPointBounds = (feature) => {
  let bounds = new mapboxgl.LngLatBounds();
  feature.geometry.coordinates.forEach((coordinatePair) => {
    bounds.extend(coordinatePair);
  });
  return bounds;
};

/**
 * Pan and zoom to a map feature. Only supports Point geometries.
 **/
export const easeToPointFeature = (map, feature) => {
  const coordinates = feature.geometry.coordinates;
  map.easeTo({
    center: coordinates,
    zoom: 13,
    duration: 1000,
  });
};

/**
 * Zoom to a features bounding box.
 **/
export const fitFeatureBounds = (map, feature) => {
  const bounds = getMultiPointBounds(feature);
  map.fitBounds(bounds, { padding: 100 });
};

/**
 * Hook which initializes a Mapbox GL map
 **/
const useMap = (mapContainerRef, mapRef) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      ...MAP_OPTIONS,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current.once("load").then(() => setIsMapLoaded(true));
    return () => mapRef.current?.remove();
  }, [mapContainerRef, mapRef]);
  return isMapLoaded;
};

function CustomToggle({ children, eventKey }) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    setIsExpanded(!isExpanded)
  );
  return (
    <div
      className="d-flex w-100 justify-content-center bg-light"
      onClick={decoratedOnClick}
      role="button"
      style={{ cursor: "pointer" }}
    >
      <h6>{!isExpanded ? <FaCaretDown /> : <FaCaretUp />}</h6>
    </div>
  );
}

/**
 * A customizeable Mapbox GL map component which renders a point or multipoint layer and enables basic interactivity.
 **/
export default function Map({
  geojson,
  layerStyle,
  mapContainerRef,
  mapRef,
  selectedFeature,
  setSelectedFeature,
  onFeatureClick,
}) {
  const isMapLoaded = useMap(mapContainerRef, mapRef);

  /**
   * Add the geojson layer to the map (only once!)
   */
  useEffect(() => {
    isMapLoaded &&
      geojson &&
      !mapRef?.current?.getLayer(layerStyle.id) &&
      addPointLayer({
        map: mapRef.current,
        layer: layerStyle,
        geojson: geojson,
        onFeatureClick: onFeatureClick,
      });
  }, [geojson, isMapLoaded, layerStyle, mapRef, onFeatureClick]);

  /**
   * Update source data when geojson changes (i.e., is filtered)
   */
  useEffect(() => {
    const source = mapRef?.current?.getSource(layerStyle.id);
    if (mapRef?.current && source) {
      source.setData(geojson);
    }
  }, [geojson, mapRef, layerStyle]);

  return (
    <div className={styles["map-container"]} ref={mapContainerRef}>
      {selectedFeature && (
        <>
          {selectedFeature.geometry.type === "Point" && (
            <Marker map={mapRef.current} feature={selectedFeature} />
          )}
        </>
      )}
      {!isMapLoaded && (
        <div className="d-flex justify-content-center">
          <Spinner className="text-secondary" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </div>
  );
}
