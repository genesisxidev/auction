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

          <div className="container f-col w-full gap-[41px] pt-[53px]">
            <p className="lg:text-[28px] text-[24px] bold text-center text-white text-shadow font-alte-haas-grotesk">
              <span>Welcome to the</span>
              <br />
              <span>Genesis XI Auction</span>
            </p>
            <div className="f-col w-full lg:gap-[23px] md:gap-[15px] gap-[10px]">
              {/* Internal link: View Live Auction */}
              <Landing_btn
                title={
                  <p className="landing-auction-box-text text-white">
                    View Live Auction
                  </p>
                }
                link="/live-auction"
              />

              {/*
                HIGHLIGHTED CHANGE:
                Replaced Landing_btn with an <a> tag for the external link.
                This ensures that the external URL is handled properly,
                since Landing_btn likely uses React Router's <Link> for internal navigation.
              */}
              <a
                href="https://lazyapeofficial.com/genesisxi"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-auction-box"
              >
                <p className="landing-auction-box-text text-light-blue">
                  View Upcoming Auctions
                </p>
              </a>

              {/* Internal link: Ended Auctions */}
              <Landing_btn
                title={
                  <p className="landing-auction-box-text text-white">
                    Ended Auctions
                  </p>
                }
                link="/ended-auction"
              />

              {/* Admin-only link: create auction */}
              {isAdmin && (
                <Landing_btn
                  title={
                    <p className="landing-auction-box-text text-white">
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
