import React, { useEffect } from "react";

const ModalWrapper = ({ children, className, setIsModalOpen }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleCloseModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
  };
  return (
    <div className="modal-backdrop">
      <div className="w-full">
        <div className="min-h-full h-full  crelative top-0 w-full flex-center">
          <div className="h-full flex-center absolute w-full top-0 p-5">
            <div
              className={`modal-container ${className}  md:px-0 px-2 slide-down-big-in`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-full bg-[rgba(18,18,18,0.95)]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
