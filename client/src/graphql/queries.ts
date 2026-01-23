import { gql, DocumentNode } from "@apollo/client";

interface Queries {
  IS_LOGGED_IN: DocumentNode;
  USER_ID: DocumentNode;
  FETCH_USER: DocumentNode;
  FETCH_SHELTER: DocumentNode;
  SHELTER_APPLICATIONS: DocumentNode;
  FIND_ANIMALS: DocumentNode;
  FETCH_ANIMAL: DocumentNode;
  USER_FAVORITES: DocumentNode;
  USER_FAVORITE_IDS: DocumentNode;
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
  FETCH_SHELTER: gql`
    query FetchShelter($_id: ID) {
      shelter(_id: $_id) {
        _id
        name
        location
        paymentEmail
        animals {
          _id
          name
          type
          breed
          age
          sex
          status
          image
        }
      }
    }
  `,
  SHELTER_APPLICATIONS: gql`
    query ShelterApplications($shelterId: ID!) {
      shelterApplications(shelterId: $shelterId) {
        _id
        animalId
        userId
        applicationData
        status
        submittedAt
        animal {
          _id
          name
          image
        }
      }
    }
  `,
  USER_FAVORITES: gql`
    query UserFavorites($userId: ID!) {
      userFavorites(userId: $userId) {
        _id
        name
        type
        breed
        age
        sex
        color
        image
        status
      }
    }
  `,
  USER_FAVORITE_IDS: gql`
    query UserFavoriteIds($_id: ID!) {
      user(_id: $_id) {
        _id
        favoriteIds
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
