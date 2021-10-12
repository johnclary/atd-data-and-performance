import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { addPointLayer, useMap, Popup } from "./helpers";
import styles from "../../styles/Map.module.css";

/**
 * A customizeable Mapbox GL map component which renders a point or multipoint layer and enables basic interactivity.
 **/
export default function Map({
  geojson,
  layerStyle,
  mapContainerRef,
  mapRef,
  selectedFeature,
  onFeatureClick,
  getPopupContent
}) {
  const isMapLoaded = useMap(mapContainerRef, mapRef);

  useEffect(() => {
    isMapLoaded &&
      geojson &&
      !mapRef.current.getLayer(layerStyle.id) &&
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
    if (source) {
      source.setData(geojson);
    }
  }, [geojson, mapRef, layerStyle]);

  return (
    <div className={styles["map-container"]} ref={mapContainerRef}>
      {selectedFeature && (
        <>
          {getPopupContent && (
            <Popup map={mapRef.current} feature={selectedFeature} getPopupContent={getPopupContent}/>
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
