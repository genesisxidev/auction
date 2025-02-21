import React from "react";
import { Link } from "react-router-dom";

const Landing_btn = ({ title, link }) => {
  return (
    <Link to={link} className="landing-auction-box">
      {title}
    </Link>
  );
};

export default Landing_btn;
