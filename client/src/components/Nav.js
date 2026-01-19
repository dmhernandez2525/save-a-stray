import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import { ApolloConsumer } from '@apollo/client';
import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../util/withRouter';
import './css/App.css'
const { IS_LOGGED_IN } = Queries;

const Nav = props => {
  let Back;
  if (props.history.location.pathname === "/" || props.history.location.pathname === "/Landing") {
    Back = (<div></div>)
  }else{
    Back = (
      <button
        id='logout'
        className="font-capriola text-[3vw] mx-5 my-[5px] text-sky-blue bg-transparent border-none self-center cursor-pointer hover:underline hover:decoration-salmon focus:outline-none"
        onClick={e => {
          e.preventDefault();
          props.history.goBack()
        }}
      >
        back
      </button>
    )
  }

  return (
    <div id='navbar' className="col-start-3 col-end-5 row-start-1 row-end-2 z-10 grid grid-rows-[15%_70%_15%] relative">
      <div id='nav-right' className="row-start-2 flex justify-self-end">
        <ApolloConsumer>
          {client => (
            <Query query={IS_LOGGED_IN}>
              {({ data }) => {
                if (data.isLoggedIn) {
                  return (
                    <div className='auth-links flex flex-row-reverse justify-center'>
                      <button
                        id='logout'
                        className="font-capriola text-[3vw] mx-5 my-[5px] text-sky-blue bg-transparent border-none self-center cursor-pointer hover:underline hover:decoration-salmon focus:outline-none"
                        onClick={e => {
                          e.preventDefault();
                          localStorage.removeItem("auth-token");
                          client.writeData({ data: { isLoggedIn: false } });
                          props.history.push("/");
                        }}
                      >
                        Logout
                      </button>
                      {Back}
                    </div>
                  );
                } else {
                  return (
                    <div className='auth-links flex flex-row-reverse justify-center'>
                      <Link
                        to="/login"
                        className="font-capriola text-[calc(2vw+1vh)] mx-[1vw] text-sky-blue no-underline self-center hover:underline hover:decoration-salmon"
                      >
                        Login
                      </Link>
                      <br />
                      <Link
                        to="/register"
                        className="font-capriola text-[calc(2vw+1vh)] mx-[1vw] text-sky-blue no-underline self-center hover:underline hover:decoration-salmon"
                      >
                        Register
                      </Link>
                      <br/>
                    </div>
                  );
                }
              }}
            </Query>
          )}
        </ApolloConsumer>
      </div>
    </div>
  );
};

export default withRouter(Nav);