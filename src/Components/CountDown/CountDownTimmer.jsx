import React from "react";
import Countdown, { zeroPad } from "react-countdown";
import { convertUnixTimestampToLocalDate } from "../../helpers/helper";

const CountDownTimmer = ({ Timer }) => {
  console.log(Timer);
  const CountdownRender = ({ days, hours, minutes, seconds }) => {
    return (
      <div className="countdown_wrapper">
        <div className="displayedTime">
          <div className="countBox">
            <div className="countBoxItem">
              <div className="count">{zeroPad(days)}</div>
              <div className="label">
                <span>D</span>
              </div>
            </div>
            <div className="countBoxItem">
              <div className="count">{zeroPad(hours)}</div>
              <div className="label">
                <span>H</span>
              </div>
            </div>
            <div className="countBoxItem">
              <div className="count">{zeroPad(minutes)}</div>
              <div className="label">
                <span>M</span>
              </div>
            </div>
            <div className="countBoxItem">
              <div className="count">{zeroPad(seconds)}</div>
              <div className="label">
                <span>S</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Countdown
      date={convertUnixTimestampToLocalDate(Timer)}
      renderer={CountdownRender}
    />
  );
};

export default CountDownTimmer;
