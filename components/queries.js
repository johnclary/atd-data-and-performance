export const TRAFFIC_CAMERAS_QUERY = {
  resourceId: "b4k4-adkb",
  format: "geojson",
  params: [
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
  params: [
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
  params: [
    {
      key: "limit",
      value: "99999999",
    },
  ],
};

export const SIGNAL_STATUS_QUERY = {
  resourceId: "5zpr-dehc",
  format: "geojson",
  params: [
    {
      key: "limit",
      value: "99999999",
    },
    {
      key: "order",
      value: "location_name asc",
    },
    {
      key: "where",
      value: "operation_state in ('1','2','3')",
    },
  ],
};
