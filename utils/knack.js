import useSWR from "swr";

const fetcher = (url, headers) =>
  fetch(url, { headers: headers }).then((res) => {
    return res.json();
  });

export default function useKnack({ url, headers }) {
  const { data, error } = useSWR([url, headers], fetcher);
  return {
    data: data,
    loading: !error && !data,
    error: error,
  };
}
