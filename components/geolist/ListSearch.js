import React, { useState } from "react";
import { Button, Form, Navbar, InputGroup, Container } from "react-bootstrap";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import CheckboxFilters from "./CheckboxFilters";

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

export default function ListSearch({
  filters,
  setFilters,
  setSelectedFeature,
}) {
  const handleChange = (e) => {
    // remove the selected feature when typing in search box
    // ensures map popup is removed as features are filtered
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
              <CheckboxFilters filters={filters} setFilters={setFilters} />
            </Navbar.Collapse>
          )}
        </Container>
      </Navbar>
    </>
  );
}
