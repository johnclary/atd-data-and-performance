import React from "react";
import { Row, Col } from "react-bootstrap";
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format as d3Format } from "d3-format";
import { Spinner } from "react-bootstrap";

const TICK_STYLES = { fontSize: ".7em" };

const tripReducer = (previousValue, currentValue) => {
  const date = new Date(currentValue.date + "z").toLocaleDateString();
  const mode = currentValue.vehicle_type;
  const count = currentValue.count;
  let match = previousValue.find((trip) => trip.date === date) || {
    date: date,
  };
  match[mode] = parseInt(count);
  previousValue.push(match);
  return previousValue;
};

const formatMonthYear = (dateString) => {
  const utcDate = new Date(dateString + "z");
  const month = utcDate.getMonth() + 1;
  const year = utcDate.getFullYear();
  return `${month}-${year}`;
};

const reduceToMonth = (previousValue, currentValue) => {
  const date = formatMonthYear(currentValue.date);
  const count = parseInt(currentValue.count);
  let matchingTrip = previousValue.find((trip) => trip.date === date);

  if (matchingTrip) {
    matchingTrip.count =
      matchingTrip.count === undefined ? count : matchingTrip.count + count;
  } else {
    matchingTrip = { date: date, count: count };
    previousValue.push(matchingTrip);
  }
  return previousValue;
};

const renderThousands = (n) => {
  return d3Format(",d")(n);
};

const formatYAxis = (tickItem) => renderThousands(tickItem);

const renderTooltip = (props) => {
  return props.label.toLocaleDateString();
};

export default function TripChart({ data, loading, error }) {
  const [showDaily, setShowDaily] = React.useState(true);

  if (loading) {
    return (
      <>
        <p className="me-4 text-primary">Searching millions of records...</p>
        <Spinner className="text-secondary" animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </>
    );
  }
  if (!data) {
    return <p>no data</p>;
  }

  if (!showDaily) {
    data = data.reduce(reduceToMonth, []);
  } else {
    data.forEach((trip) => {
      trip.date = new Date(trip.date).toLocaleDateString();
      trip.count = parseInt(trip.count);
    });
  }

  return (
    <>
      <Row>
        {/* <Col>
          <button onClick={()=>{setShowDaily(!showDaily)}}>Hello</button>
        </Col> */}
      </Row>
      <Row style={{ minHeight: 500 }}>
        <Col>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              minWidth={200}
              minHeight={200}
              data={data}
              margin={{
                top: 40,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={TICK_STYLES} />
              <YAxis
                tick={TICK_STYLES}
                tickFormatter={formatYAxis}
                orientation={"right"}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
              {/* <Line type="monotone" dataKey="count" stroke="#8884d8" dot={false} /> */}
              {/* <Line type="linear" dataKey="bicycle" stroke="red" dot={false} />
        <Line type="linear" dataKey="moped" stroke="green" dot={false} /> */}
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </>
  );
}
