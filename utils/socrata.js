import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    error.statusText = res.statusText;
    throw error;
  }
  return res.json();
};

const buildQuery = (params) => {
  if (!params || params.length === 0) return null;
  return params
    .map((param) => {
      return `$${param.key}=${param.value}`;
    })
    .join("&");
};

const buildUrl = ({ resourceId, format, query }) => {
  let url = `https://data.austintexas.gov/resource/${resourceId}.${format}`;
  url = query ? `${url}?${query}` : url;
  return url;
};

export default function useSocrata({ resourceId, format, params }) {
  const query = buildQuery(params);
  const url = buildUrl({ resourceId, format, query });
  // by passing an array of args as the useSWR key, SWR will detect changes to the inputs and re-fetch as needed
  const { data, error } = useSWR(url, fetcher);
  return {
    data: data,
    loading: !error && !data,
    error: error,
  };
}
