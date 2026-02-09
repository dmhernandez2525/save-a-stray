import React from "react";
import { withRouter, WithRouterProps } from "../util/withRouter";
import UserLanding from "./UserLanding";
import { Button } from "./ui/button";

interface SplashProps extends WithRouterProps {}

const openFeed = () => {
  const button = document.getElementById("splash-button");
  const feed = document.getElementById("splash-feed-wrapper");
  if (button && feed) {
    button.classList.toggle("closed");
    button.classList.toggle("open");
    feed.classList.toggle("hidden");
  }
};

const Splash: React.FC<SplashProps> = () => {
  return (
    <div className="col-start-1 col-end-6 md:col-start-3 md:col-end-5 row-start-1 md:row-start-2 row-end-3 bg-cover grid grid-cols-1 md:grid-cols-splash pb-20 md:pb-0">
      <div
        className="col-start-1 col-end-4 rounded-[20px] bg-[url('/src/components/css/adorable-animal-black-and-white-207903.jpg')] bg-no-repeat bg-cover bg-center grid grid-rows-splash-top grid-cols-splash-top"
      >
        <button
          className="closed border-none p-2 w-full text-white text-[21px] font-capriola cursor-pointer col-start-1 col-end-4 transition-all duration-700 ease-in-out hover:bg-salmon focus:outline-none h-[100px] row-start-1 row-end-4 bg-sky-blue rounded-t-[15px]"
          id="splash-button"
          style={{
            transition: "all 0.75s ease-in-out",
          }}
        >
          <h2
            onClick={openFeed}
            className="text-white text-[calc(1vh+2vw)] m-auto transition-all duration-700 ease-in cursor-pointer"
          >
            Browse Animals
          </h2>
          <div
            id="splash-feed-wrapper"
            className="hidden w-full h-full animate-droop"
          >
            <p
              onClick={openFeed}
              className="no-underline text-white text-[4em] m-0 font-capriola float-left ml-[2%] cursor-pointer"
            >
              X
            </p>
            <UserLanding splash="splash" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default withRouter(Splash);
