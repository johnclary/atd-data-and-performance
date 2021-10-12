import React, { useState } from "react";
import Image from "react-bootstrap/Image";
import { Spinner as BsSpinner } from "react-bootstrap";

export default function Thumbnail({ camera_id }) {
  const [loading, setLoading] = useState(true);
  const src = `https://cctv.austinmobility.io/image/${camera_id}.jpg`;
  return (
    <>
      {loading && (
        <BsSpinner
          className="text-secondary"
          animation="border"
          role="status"
        />
      )}
      <Image
        className={loading ? "d-none" : ""}
        alt="Image from traffic camera"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/assets/unavailable.jpg";
        }}
        onLoad={() => setLoading(false)}
        src={src}
        fluid
      />
    </>
  );
}
