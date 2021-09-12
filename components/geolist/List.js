import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { Collapse, Fade } from "react-bootstrap";

/**
 * A Bootstrap table component which renders geojson features as table rows.
 *
 * @param {Object[]}  features - an array of geojson features
 * @param { function(object) : string } listItemRenderer - Function which accepts a single feature and returns a string value
 * @param { function(object) } onRowClick - An optional callback function which accepts a single feature and will be called when a table row is clicked.
 */

export default function Table({
  features,
  listItemRenderer,
  onRowClick,
  selectedFeature,
}) {
  if (!features || features.length === 0) {
    // TODO: render something helpful? e.g., "No data to display"
    return null;
  }

  return (
    <ListGroup key="data-list" variant="flush">
      {features.map((feature, i) => {
        return (
          <ListGroup.Item
            key={i}
            action
            onClick={(e) => {
              onRowClick && onRowClick(feature);
            }}
          >
            {listItemRenderer(feature)}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
