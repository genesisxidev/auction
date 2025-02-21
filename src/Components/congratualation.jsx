import React from "react";
import ModalWrapper from "./ModalWrapper/Wrapper";

const Congratualation = () => {
  return (
    <ModalWrapper className="max-w-[37.125rem]">
      <div className="h-[391px] w-full flex-center flex-col gap-5 font-alte-haas-grotesk">
        <p className="lg:text-[35px] md:text-[28px] text-[24px] font-bold text-center text-white ">
          CONGRATULATIONS!
        </p>
        <p className="lg:text-[4rem] md:text-[3rem] text-[2.5rem] font-bold text-center text-[#4ad35f] ">
          YOU WON!
        </p>
        <button className="cursor-pointer lg:w-[194px] lg:h-[53px] w-[151px] h-[40px] rounded-[47px] bg-[#85f2e0]/[0.83] lg-text font-bold text-center text-white flex-center uppercase ">
          claim
        </button>
      </div>
    </ModalWrapper>
  );
};

export default Congratualation;
