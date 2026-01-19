import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import { ApolloConsumer } from '@apollo/client';
import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../util/withRouter';
import './css/splash.css'
import UserLanding from "./UserLanding";
const { IS_LOGGED_IN } = Queries;


function openFeed(e){
  let button = document.getElementById('splash-button')
  let feed = document.getElementById('splash-feed-wrapper')
  button.classList.toggle('closed')
  button.classList.toggle('open')
  feed.classList.toggle('hidden')
}


const Splash = props => {

  return (
    <div
      id='splash'
      className="col-start-3 col-end-5 row-start-2 row-end-3 bg-cover grid grid-cols-[15%_70%_15%]"
    >
      <div
        id='splash-top'
        className="col-start-1 col-end-4 rounded-[20px] bg-[url('./css/adorable-animal-black-and-white-207903.jpg')] bg-no-repeat bg-cover bg-center grid grid-rows-[75%_10%_15%] grid-cols-[35%_30%_35%]"
      >
        <button
          className='closed'
          id='splash-button'
        >
          <h2
            id='browse'
            onClick={e => openFeed(e)}
            className="text-white text-[calc(1vh+2vw)] m-auto transition-all duration-[800ms] ease-in cursor-pointer"
          >
            Browse Animals
          </h2>
          <div
            id='splash-feed-wrapper'
            className='hidden w-full h-full animate-droop'
          >
            <p
              id='splash-feed-exit'
              onClick={e => openFeed(e)}
              className="no-underline text-white text-[4em] m-0 font-capriola float-left ml-[2%] cursor-pointer"
            >
              X
            </p>
            <UserLanding splash={"splash"}/>
          </div>
        </button>
      </div>
    </div>
  );
};

export default withRouter(Splash);