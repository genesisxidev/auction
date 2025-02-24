import React from "react";
import Layout from "../../Layout/Layout";
import Congratualation from "../../Components/congratualation";
import { Link } from "react-router-dom";
import Landing_btn from "../../Components/landing_btn";
import useAuction from "../../context/AuctionContext";
import useScrolltoTop from "../../hook/useScrolltoTop";
import InfoModal from "../../Components/InfoModal";

const HomePage = () => {
  const { isAdmin } = useAuction();
  useScrolltoTop();
  return (
    <>
      <div className="py-[114px]">
        <div className="page-container">
          <div className="element z-[-1] absolute top-0 left-0 w-full h-full"></div>

          <div className="container f-col w-full  gap-[41px] pt-[53px]">
            <p class="lg:text-[28px] text-[24px] bold text-center text-white text-shadow font-alte-haas-grotesk">
              <span>Welcome to </span>
              
              <span>Genesis XI
</span>
            </p>
            <div className="f-col w-full lg:gap-[23px] md:gap-[15px] gap-[10px]">
              {/* <Link to="/auction" className="landing-auction-box">
                <p class="landing-auction-box-text text-white ">
                  View Live Auction
                </p>
              </Link> */}
              <Landing_btn
                title={
                  <p class="landing-auction-box-text text-white ">
                    View Live Auction
                  </p>
                }
                link="/live-auction"
              />
              <Landing_btn
                title={
                  <p class="landing-auction-box-text text-light-blue">
                    View Upcoming Auctions
                  </p>
                }
                link="/"
              />
              <Landing_btn
                title={
                  <p class="landing-auction-box-text text-white ">
                    Ended Auctions
                  </p>
                }
                link="/ended-auction"
              />
              {isAdmin && (
                <Landing_btn
                  title={
                    <p class="landing-auction-box-text text-white">
                      create auction
                    </p>
                  }
                  link="/admin/create-auction"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <InfoModal />
      {/* <Congratualation /> */}
    </>
  );
};

export default HomePage;
