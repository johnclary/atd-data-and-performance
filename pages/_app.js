import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.scss";
import { Spinner } from "../components/Spinner";

function App({ Component, pageProps }) {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    const handleRouteStart = () => {
      setIsRouting(true);
    };

    const handeRouteComplete = () => {
      setIsRouting(false);
    };
    router.events.on("routeChangeStart", handleRouteStart);

    router.events.on("routeChangeComplete", handeRouteComplete);
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeStart", handeRouteComplete);
    };
  }, [router.events]);

  if (isRouting)
    return (
      <Spinner/>
    );
  return <Component {...pageProps} />;
}

export default App;
