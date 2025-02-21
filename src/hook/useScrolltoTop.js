import { useEffect } from "react";

export const useScrolltoTop = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
};

export default useScrolltoTop;
