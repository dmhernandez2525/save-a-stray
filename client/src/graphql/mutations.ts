import { gql, DocumentNode } from "@apollo/client";

interface Mutations {
  REGISTER_USER: DocumentNode;
  LOGIN_USER: DocumentNode;
  VERIFY_USER: DocumentNode;
  USER_ID: DocumentNode;
  CREATE_ANIMAL: DocumentNode;
  UPDATE_ANIMAL_STATUS: DocumentNode;
  UPDATE_APPLICATION_STATUS: DocumentNode;
  UPDATE_USER: DocumentNode;
  ADD_FAVORITE: DocumentNode;
  REMOVE_FAVORITE: DocumentNode;
  CREATE_APPLICATION: DocumentNode;
  CREATE_SHELTER: DocumentNode;
  EDIT_SHELTER: DocumentNode;
  ADD_MEDICAL_RECORD: DocumentNode;
  CREATE_REVIEW: DocumentNode;
  CREATE_SUCCESS_STORY: DocumentNode;
  ADD_SHELTER_STAFF: DocumentNode;
  REMOVE_SHELTER_STAFF: DocumentNode;
  BULK_CREATE_ANIMALS: DocumentNode;
  CREATE_EVENT: DocumentNode;
  DELETE_EVENT: DocumentNode;
  CREATE_DONATION: DocumentNode;
  CREATE_FOSTER: DocumentNode;
  UPDATE_FOSTER_STATUS: DocumentNode;
  CREATE_SAVED_SEARCH: DocumentNode;
  DELETE_SAVED_SEARCH: DocumentNode;
}

const mutations: Mutations = {
  REGISTER_USER: gql`
    mutation RegisterUser(
      $userRole: String
      $name: String!
      $email: String!
      $password: String!
      $shelterName: String
      $shelterLocation: String
      $shelterPaymentEmail: String
    ) {
      register(
        userRole: $userRole
        name: $name
        email: $email
        password: $password
        shelterName: $shelterName
        shelterLocation: $shelterLocation
        shelterPaymentEmail: $shelterPaymentEmail
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
      $images: [String]
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
        images: $images
        video: $video
        applications: $applications
      ) {
        name
        type
        age
        sex
        color
        description
        images
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
  UPDATE_USER: gql`
    mutation UpdateUser($_id: ID!, $name: String, $email: String) {
      updateUser(_id: $_id, name: $name, email: $email) {
        _id
        name
        email
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
  EDIT_SHELTER: gql`
    mutation EditShelter(
      $_id: ID!
      $name: String
      $location: String
      $paymentEmail: String
      $phone: String
      $email: String
      $website: String
      $hours: String
      $description: String
    ) {
      editShelter(
        _id: $_id
        name: $name
        location: $location
        paymentEmail: $paymentEmail
        phone: $phone
        email: $email
        website: $website
        hours: $hours
        description: $description
      ) {
        _id
        name
        location
        paymentEmail
        phone
        email
        website
        hours
        description
      }
    }
  `,
  CREATE_REVIEW: gql`
    mutation CreateReview($userId: String!, $shelterId: String!, $rating: Int!, $comment: String) {
      createReview(userId: $userId, shelterId: $shelterId, rating: $rating, comment: $comment) {
        _id
        userId
        shelterId
        rating
        comment
        createdAt
      }
    }
  `,
  ADD_MEDICAL_RECORD: gql`
    mutation AddMedicalRecord(
      $animalId: ID!
      $date: String!
      $recordType: String!
      $description: String!
      $veterinarian: String
    ) {
      addMedicalRecord(
        animalId: $animalId
        date: $date
        recordType: $recordType
        description: $description
        veterinarian: $veterinarian
      ) {
        _id
        medicalRecords {
          _id
          date
          recordType
          description
          veterinarian
        }
      }
    }
  `,
  CREATE_SUCCESS_STORY: gql`
    mutation CreateSuccessStory(
      $userId: String!
      $animalName: String!
      $animalType: String!
      $title: String!
      $story: String!
      $image: String
    ) {
      createSuccessStory(
        userId: $userId
        animalName: $animalName
        animalType: $animalType
        title: $title
        story: $story
        image: $image
      ) {
        _id
        animalName
        animalType
        title
        story
        image
        createdAt
      }
    }
  `,
  ADD_SHELTER_STAFF: gql`
    mutation AddShelterStaff($shelterId: ID!, $email: String!) {
      addShelterStaff(shelterId: $shelterId, email: $email) {
        _id
        users {
          _id
        }
      }
    }
  `,
  REMOVE_SHELTER_STAFF: gql`
    mutation RemoveShelterStaff($shelterId: ID!, $userId: ID!) {
      removeShelterStaff(shelterId: $shelterId, userId: $userId) {
        _id
        users {
          _id
        }
      }
    }
  `,
  BULK_CREATE_ANIMALS: gql`
    mutation BulkCreateAnimals($animals: [AnimalInput]!, $shelterId: ID) {
      bulkCreateAnimals(animals: $animals, shelterId: $shelterId) {
        _id
        name
        type
        breed
        age
        sex
        color
        status
      }
    }
  `,
  CREATE_EVENT: gql`
    mutation CreateEvent(
      $shelterId: ID!
      $title: String!
      $description: String
      $date: String!
      $endDate: String
      $location: String
      $eventType: String
    ) {
      createEvent(
        shelterId: $shelterId
        title: $title
        description: $description
        date: $date
        endDate: $endDate
        location: $location
        eventType: $eventType
      ) {
        _id
        title
        date
        eventType
      }
    }
  `,
  DELETE_EVENT: gql`
    mutation DeleteEvent($_id: ID!) {
      deleteEvent(_id: $_id) {
        _id
      }
    }
  `,
  CREATE_DONATION: gql`
    mutation CreateDonation(
      $shelterId: ID!
      $userId: String
      $donorName: String!
      $amount: Float!
      $message: String
    ) {
      createDonation(
        shelterId: $shelterId
        userId: $userId
        donorName: $donorName
        amount: $amount
        message: $message
      ) {
        _id
        donorName
        amount
        message
        createdAt
      }
    }
  `,
  CREATE_FOSTER: gql`
    mutation CreateFoster(
      $shelterId: ID!
      $animalId: ID!
      $userId: String
      $fosterName: String!
      $fosterEmail: String
      $startDate: String!
      $endDate: String
      $notes: String
    ) {
      createFoster(
        shelterId: $shelterId
        animalId: $animalId
        userId: $userId
        fosterName: $fosterName
        fosterEmail: $fosterEmail
        startDate: $startDate
        endDate: $endDate
        notes: $notes
      ) {
        _id
        animalId
        fosterName
        fosterEmail
        startDate
        endDate
        status
        notes
      }
    }
  `,
  UPDATE_FOSTER_STATUS: gql`
    mutation UpdateFosterStatus($_id: ID!, $status: String!, $endDate: String, $notes: String) {
      updateFosterStatus(_id: $_id, status: $status, endDate: $endDate, notes: $notes) {
        _id
        status
        endDate
        notes
      }
    }
  `,
  CREATE_SAVED_SEARCH: gql`
    mutation CreateSavedSearch(
      $userId: ID!
      $name: String!
      $type: String
      $breed: String
      $sex: String
      $color: String
      $status: String
      $minAge: Int
      $maxAge: Int
    ) {
      createSavedSearch(
        userId: $userId
        name: $name
        type: $type
        breed: $breed
        sex: $sex
        color: $color
        status: $status
        minAge: $minAge
        maxAge: $maxAge
      ) {
        _id
        name
        filters {
          type
          breed
          sex
          color
          status
          minAge
          maxAge
        }
        createdAt
      }
    }
  `,
  DELETE_SAVED_SEARCH: gql`
    mutation DeleteSavedSearch($_id: ID!) {
      deleteSavedSearch(_id: $_id) {
        _id
      }
    }
  `
};

export default mutations;
