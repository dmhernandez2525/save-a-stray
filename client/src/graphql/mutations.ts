import { gql, DocumentNode } from "@apollo/client";

interface Mutations {
  REGISTER_USER: DocumentNode;
  LOGIN_USER: DocumentNode;
  VERIFY_USER: DocumentNode;
  USER_ID: DocumentNode;
  CREATE_ANIMAL: DocumentNode;
  UPDATE_ANIMAL_STATUS: DocumentNode;
  UPDATE_APPLICATION_STATUS: DocumentNode;
  ADD_FAVORITE: DocumentNode;
  REMOVE_FAVORITE: DocumentNode;
  CREATE_APPLICATION: DocumentNode;
  CREATE_SHELTER: DocumentNode;
  SET_ADOPTION_FEE: DocumentNode;
  UPDATE_ADOPTION_FEE_STATUS: DocumentNode;
  WAIVE_ADOPTION_FEE: DocumentNode;
}

const mutations: Mutations = {
  REGISTER_USER: gql`
    mutation RegisterUser(
      $userRole: String
      $name: String!
      $email: String!
      $password: String!
    ) {
      register(
        userRole: $userRole
        name: $name
        email: $email
        password: $password
      ) {
        token
        loggedIn
        _id
        shelter {
          name
        }
      }
    }
  `,
  LOGIN_USER: gql`
    mutation LoginUser($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        loggedIn
        _id
      }
    }
  `,
  VERIFY_USER: gql`
    mutation VerifyUser($token: String!) {
      verifyUser(token: $token) {
        loggedIn
        _id
      }
    }
  `,
  USER_ID: gql`
    mutation userId($token: String!) {
      userId(token: $token) {
        _id
      }
    }
  `,
  CREATE_ANIMAL: gql`
    mutation CreateAnimal(
      $name: String!
      $type: String!
      $age: Int!
      $sex: String!
      $color: String!
      $description: String!
      $image: String
      $video: String
      $applications: ID
    ) {
      newAnimal(
        name: $name
        type: $type
        age: $age
        sex: $sex
        color: $color
        description: $description
        image: $image
        video: $video
        applications: $applications
      ) {
        name
        type
        age
        sex
        color
        description
      }
    }
  `,
  UPDATE_ANIMAL_STATUS: gql`
    mutation UpdateAnimalStatus($_id: ID!, $status: String!) {
      updateAnimalStatus(_id: $_id, status: $status) {
        _id
        status
      }
    }
  `,
  UPDATE_APPLICATION_STATUS: gql`
    mutation UpdateApplicationStatus($_id: ID!, $status: String!) {
      updateApplicationStatus(_id: $_id, status: $status) {
        _id
        status
        submittedAt
      }
    }
  `,
  ADD_FAVORITE: gql`
    mutation AddFavorite($userId: ID!, $animalId: ID!) {
      addFavorite(userId: $userId, animalId: $animalId) {
        _id
        favoriteIds
      }
    }
  `,
  REMOVE_FAVORITE: gql`
    mutation RemoveFavorite($userId: ID!, $animalId: ID!) {
      removeFavorite(userId: $userId, animalId: $animalId) {
        _id
        favoriteIds
      }
    }
  `,
  CREATE_APPLICATION: gql`
    mutation CreateApplication(
      $animalId: String!
      $userId: String!
      $applicationData: String!
    ) {
      newApplication(
        animalId: $animalId
        userId: $userId
        applicationData: $applicationData
      ) {
        _id
        animalId
        userId
        applicationData
        status
        submittedAt
      }
    }
  `,
  CREATE_SHELTER: gql`
    mutation CreateShelter(
      $name: String!
      $location: String!
      $paymentEmail: String!
    ) {
      newShelter(name: $name, location: $location, paymentEmail: $paymentEmail) {
        name
        location
        paymentEmail
        _id
      }
    }
  `,
  SET_ADOPTION_FEE: gql`
    mutation SetAdoptionFee(
      $animalId: String!
      $shelterId: String!
      $amount: Float!
      $currency: String
      $description: String
    ) {
      setAdoptionFee(
        animalId: $animalId
        shelterId: $shelterId
        amount: $amount
        currency: $currency
        description: $description
      ) {
        _id
        animalId
        shelterId
        amount
        currency
        description
        status
        createdAt
      }
    }
  `,
  UPDATE_ADOPTION_FEE_STATUS: gql`
    mutation UpdateAdoptionFeeStatus($_id: ID!, $status: String!, $paidBy: String) {
      updateAdoptionFeeStatus(_id: $_id, status: $status, paidBy: $paidBy) {
        _id
        status
        paidAt
        paidBy
      }
    }
  `,
  WAIVE_ADOPTION_FEE: gql`
    mutation WaiveAdoptionFee($_id: ID!, $waivedReason: String) {
      waiveAdoptionFee(_id: $_id, waivedReason: $waivedReason) {
        _id
        waived
        waivedReason
        status
      }
    }
  `
};

export default mutations;
