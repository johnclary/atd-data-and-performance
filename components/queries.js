export const TRAFFIC_CAMERAS_QUERY = {
  resourceId: "b4k4-adkb",
  format: "geojson",
  args: [
    { key: "limit", value: "9999999999" },
    {
      key: "order",
      value: "location_name asc",
    },
    {
      key: "select",
      value:
        "location_name,location,camera_id,ip_comm_status,screenshot_address",
    },
    {
      key: "where",
      value: "camera_status in ('TURNED_ON')",
    },
  ],
};

export const SIGNAL_CORRIDORS_QUERY = {
  resourceId: "efct-8fs9",
  format: "geojson",
  args: [
    {
      key: "order",
      value: "location_name asc",
    },
    {
      key: "limit",
      value: "99999999",
    },
    {
      key: "select",
      value: "system_id,system_name,signal_id,location_name,location",
    },
  ],
};

export const SIGNAL_RETIMING_QUERY = {
  resourceId: "g8w2-8uap",
  format: "json",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
  ],
};

export const SIGNAL_STUDIES_QUERY = {
  resourceId: "sgur-43uy",
  format: "geojson",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
  ],
};

export const SIGNAL_PROJECTS_QUERY = {
  resourceId: "sgv2-7xw2",
  format: "json",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
  ],
};

export const SIGNAL_STATUS_QUERY = {
  resourceId: "5zpr-dehc",
  format: "geojson",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
    {
      key: "order",
      value: "operation_state asc, location_name asc",
    },
    {
      key: "where",
      value: "operation_state in ('1','2','3')",
    },
  ],
};

export const SIGNALS_QUERY = {
  resourceId: "p53x-x73x",
  format: "geojson",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
    {
      key: "order",
      value: "location_name asc",
    },
    {
      key: "select",
      value: "location_name,signal_id,signal_type,signal_status,location",
    },
  ],
};

export const SIGNAL_LOCATIONS_QUERY = {
  resourceId: "rfuv-5rhh",
  format: "geojson",
  args: [
    {
      key: "limit",
      value: "99999999",
    },
    {
      key: "order",
      value: "atd_location_id asc",
    },
    {
      key: "select",
      value: "atd_location_id,location",
    },
  ],
};

// static query substrings
const tripSelectorsQuery =
  "avg(trip_duration)/60 as avg_duration_minutes, sum(trip_distance) * 0.000621371 as total_miles, avg(trip_distance) * 0.000621371 as avg_miles, count(trip_id) as total_trips";

const tripFiltersQuery =
  "trip_distance * 0.000621371 >= 0.1 AND trip_distance * 0.000621371 < 500 AND trip_duration < 86400";

export const MICROMOBILITY_BY_MODE_QUERY = {
  resourceId: "7d8e-dm7r",
  format: "json",
  args: [
    {
      key: "query",
      value: `SELECT vehicle_type, ${tripSelectorsQuery} WHERE start_time BETWEEN '$startDate' AND '$endDate' AND ${tripFiltersQuery} GROUP BY vehicle_type`,
    },
  ],
};

export const MICROMOBILITY_DEVICE_COUNT_QUERY = {
  resourceId: "7d8e-dm7r",
  format: "json",
  args: [
    {
      key: "query",
      value: `SELECT DISTINCT device_id, vehicle_type WHERE start_time BETWEEN '$startDate' AND '$endDate' |> select vehicle_type, count(device_id) as unique_devices group by vehicle_type`,
    },
  ],
};

export const MICROMOBILITY_311_QUERY = {
  resourceId: "xwdj-i9he",
  format: "json",
  args: [
    {
      key: "query",
      value: `SELECT count(sr_type_desc) WHERE sr_created_date between '$startDate' AND '$endDate' AND (contains(upper(\`sr_type_desc\`), upper('dockless')))`,
    },
  ],
};

export const MICROMOBILITY_TRIPS_BY_DAY_QUERY = {
  resourceId: "7d8e-dm7r",
  format: "json",
  args: [
    {
      key: "query",
      value: `SELECT date_trunc_ymd(start_time) as date, count(trip_id) as count where start_time BETWEEN '$startDate' AND '$endDate' AND ${tripFiltersQuery} group by date order by date asc`,
    },
  ],
};


export const MICROMOBILITY_TRIPS_BY_DAY_BY_MODE_QUERY = {
  resourceId: "7d8e-dm7r",
  format: "json",
  args: [
    {
      key: "query",
      value: `SELECT date_trunc_ymd(start_time) as date, count(trip_id) as count, vehicle_type where start_time BETWEEN '$startDate' AND '$endDate' AND ${tripFiltersQuery} group by date, vehicle_type order by date asc`,
    },
  ],
};
