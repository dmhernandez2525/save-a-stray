import React from "react";
import { Query } from "@apollo/client/react/components";
import { ApolloConsumer } from "@apollo/client";
import Querys from "../graphql/queries";
import UserShow from "./UserLanding";
import ShelterShow from "./ShelterLanding.js";
const { FETCH_USER,USER_ID} = Querys;



class Landing extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            userId: ""
        };
        this.userId = "";
    }



render(){
    return (
    <ApolloConsumer>{client => {


                const user = client.readQuery({
                    query: USER_ID
                    })

                    this.userId = user.userId
    return(
        <Query
        query={FETCH_USER}
        variables={{ _id: this.userId }}
        update={(client, data) => this.updateCache(client, data)}

        >
            {({ loading, error, data }) => {

                if (loading){
                    return (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <h1 className="text-white font-capriola text-2xl animate-pulse">Loading</h1>
                        </div>
                    )
                }else{
                    if (data.user.userRole === "shelter") {
                        return <ShelterShow shelterInfo={data.user.shelter}/>
                    } else if (data.user.userRole === "endUser") {
                        return <UserShow user={data.user}/>
                    }
                }
        }}
        </Query>
        )
    }}
        </ApolloConsumer>
    )
    }
}

export default Landing