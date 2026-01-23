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
    query FindAnimals($type: String, $breed: String, $sex: String, $color: String, $name: String, $status: String, $minAge: Int, $maxAge: Int) {
      findAnimals(type: $type, breed: $breed, sex: $sex, color: $color, name: $name, status: $status, minAge: $minAge, maxAge: $maxAge) {
        _id
        name
        type
        breed
        age
        sex
        color
        description
        image
        video
        status
      }
    }
  `,
  FETCH_ANIMAL: gql`
    query Fetch_Animal($id: ID!) {
      animal(_id: $id) {
        _id
        name
        type
        breed
        age
        sex
        color
        description
        image
        video
        status
      }
    }
  `
};

export default queries;
