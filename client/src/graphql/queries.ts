import { gql, DocumentNode } from "@apollo/client";

interface Queries {
  IS_LOGGED_IN: DocumentNode;
  USER_ID: DocumentNode;
  FETCH_USER: DocumentNode;
  FIND_ANIMALS: DocumentNode;
  FETCH_ANIMAL: DocumentNode;
}

const queries: Queries = {
  IS_LOGGED_IN: gql`
    query IsUserLoggedIn {
      isLoggedIn @client
    }
  `,
  USER_ID: gql`
    query IsUserLoggedIn {
      userId @client
    }
  `,
  FETCH_USER: gql`
    query FetchUser($_id: ID!) {
      user(_id: $_id) {
        userRole
        shelter {
          name
          location
          paymentEmail
          animals {
            _id
          }
          users {
            _id
          }
        }
      }
    }
  `,
  FIND_ANIMALS: gql`
    query FindAnimals($type: String, $sex: String, $color: String, $name: String, $minAge: Int, $maxAge: Int) {
      findAnimals(type: $type, sex: $sex, color: $color, name: $name, minAge: $minAge, maxAge: $maxAge) {
        _id
        name
        type
        age
        sex
        color
        description
        image
        video
      }
    }
  `,
  FETCH_ANIMAL: gql`
    query Fetch_Animal($id: ID!) {
      animal(_id: $id) {
        _id
        name
        type
        age
        sex
        color
        description
        image
        video
      }
    }
  `
};

export default queries;
