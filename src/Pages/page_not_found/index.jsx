// src/components/NotFoundPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useScrolltoTop from "../../hook/useScrolltoTop";

const NotFoundPage = () => {
  const navigate = useNavigate();
  useScrolltoTop()
  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-black text-white">
      <h1 className=" xl:text-6xl lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-bold animate-float leading-none">404</h1>
      <p className="text-xl text-center" >
        Page not found. The page you are looking for does not exist.
      </p>
      <button className="back-home-btn" onClick={goHome}>
        Go Home
      </button>
    </div>
  );
};

export default NotFoundPage;
