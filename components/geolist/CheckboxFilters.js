import React from "react";
import { Form } from "react-bootstrap";

export default function CheckboxFilters({ filters, setFilters }) {
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
            className="text-primary"
          />
        </div>
      ))}
    </Form>
  );
}
