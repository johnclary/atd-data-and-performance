import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { FaSlideshare } from "react-icons/fa";
// TODO: move to build environment
mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

export const MAP_OPTIONS_DEFAULT = {
  center: [-97.74, 30.28],
  zoom: 11,
  style: "mapbox://styles/mapbox/light-v10",
  maxZoom: 18,
  // touchZoomRotate: false,
  touchPitch: false,
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

const stringIncludesCaseInsensitive = (str, val) => {
  return str.toLowerCase().includes(val.toLowerCase());
};

/**
 * Custom hook that that applies search and checkbox filter states to geojson features
 **/
export const useFilteredGeojson = ({ geojson, filterDefs }) => {
  const [filters, setFilters] = useState(filterDefs);
  const [filteredGeosjon, setFilteredGeojson] = useState(geojson);
  /*
    todo: we could be more efficient here by filtering on the previously filtered geojson
    but it would require more state. if the table is going to handle more than ~1000 rows
    we should implement this.
    also consider adding a timeout function to the search filter component so that it doesn't
    re-filter on each key input
  */
  useEffect(() => {
    if (!geojson?.features) return;
    // create a mutable copy of geojson
    let currentGeojson = { ...geojson };
    let currentCheckedFilters = filters.checkbox?.filter((f) => f.checked);
    let currentSearchVal = filters.search.value;
    // apply checkbox filters if any exist and are checked
    if (currentCheckedFilters && currentCheckedFilters.length > 0) {
      currentGeojson.features = currentGeojson.features.filter((feature) => {
        return (
          // filter is applied by matching feature prop val exactly to filter val
          currentCheckedFilters.some((filter) => {
            return filter.value === feature.properties[filter.featureProp];
          })
        );
      });
    }
    // apply search term filter
    if (currentSearchVal) {
      currentGeojson.features = currentGeojson.features.filter((feature) => {
        return stringIncludesCaseInsensitive(
          feature.properties[filters.search.featureProp] || "",
          currentSearchVal
        );
      });
    }
    setFilteredGeojson(currentGeojson);
  }, [geojson, filters]);
  return [filteredGeosjon, filters, setFilters];
};

export const useSelectedFeatureEffect = (
  mapRef,
  layerId,
  selectedFeature,
  selectedFeatureEffect
) => {
  useEffect(() => {
    if (
      !selectedFeatureEffect ||
      !mapRef.current ||
      !mapRef.current.getLayer(layerId)
    ) {
      return;
    }
    selectedFeatureEffect(mapRef.current, selectedFeature);
  }, [mapRef, selectedFeature, layerId, selectedFeatureEffect]);
};

/**
 * Hide overflow when map modal is showing on mobile, otherwise auto
 **/
export const useConditionalOverflow = (isSmallScreen, showMap) => {
  useEffect(() => {
    if (isSmallScreen && !showMap) {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    } else if (isSmallScreen && showMap) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      // not-small screen
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    }
  }, [isSmallScreen, showMap]);
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
    zoom: 15,
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
export const useMap = (mapContainerRef, mapRef) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      ...MAP_OPTIONS_DEFAULT,
    });
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false, showCompass: false }),
      "bottom-right"
    );
    mapRef.current.once("load").then(() => setIsMapLoaded(true));
    return () => mapRef.current?.remove();
  }, [mapContainerRef, mapRef]);
  return isMapLoaded;
};

/**
 * Add a point marker to a map
 **/
export const Marker = ({ map, feature }) => {
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
