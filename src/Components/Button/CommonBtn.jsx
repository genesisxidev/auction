import React from "react";
import Spinner from "../loader";

const CommonBtn = ({ className, text, handleClick, loading }) => {
  return (
    <button
      className={className}
      type="button"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <Spinner /> : text}
    </button>
  );
};

export default CommonBtn;
