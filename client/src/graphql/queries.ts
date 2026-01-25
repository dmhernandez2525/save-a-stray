import { gql, DocumentNode } from "@apollo/client";

interface Queries {
  IS_LOGGED_IN: DocumentNode;
  USER_ID: DocumentNode;
  FETCH_USER: DocumentNode;
  FETCH_SHELTER: DocumentNode;
  SHELTER_APPLICATIONS: DocumentNode;
  SHELTER_ANALYTICS: DocumentNode;
  USER_APPLICATIONS: DocumentNode;
  FIND_ANIMALS: DocumentNode;
  FETCH_ANIMAL: DocumentNode;
  SIMILAR_ANIMALS: DocumentNode;
  SHELTER_REVIEWS: DocumentNode;
  USER_NOTIFICATIONS: DocumentNode;
  USER_FAVORITES: DocumentNode;
  USER_FAVORITE_IDS: DocumentNode;
  SUCCESS_STORIES: DocumentNode;
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
        _id
        name
        email
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
    query FindAnimals($type: String, $breed: String, $sex: String, $color: String, $name: String, $status: String, $minAge: Int, $maxAge: Int, $limit: Int, $offset: Int) {
      findAnimals(type: $type, breed: $breed, sex: $sex, color: $color, name: $name, status: $status, minAge: $minAge, maxAge: $maxAge, limit: $limit, offset: $offset) {
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
        phone
        email
        website
        hours
        description
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
  USER_APPLICATIONS: gql`
    query UserApplications($userId: ID!) {
      userApplications(userId: $userId) {
        _id
        animalId
        applicationData
        status
        submittedAt
        animal {
          _id
          name
          image
          type
          breed
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
        images
        video
        status
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
  USER_NOTIFICATIONS: gql`
    query UserNotifications($userId: ID!) {
      userNotifications(userId: $userId) {
        _id
        message
        type
        read
        link
        createdAt
      }
    }
  `,
  SHELTER_REVIEWS: gql`
    query ShelterReviews($shelterId: ID!) {
      shelterReviews(shelterId: $shelterId) {
        _id
        userId
        rating
        comment
        createdAt
      }
    }
  `,
  SIMILAR_ANIMALS: gql`
    query SimilarAnimals($animalId: ID!, $limit: Int) {
      similarAnimals(animalId: $animalId, limit: $limit) {
        _id
        name
        type
        breed
        age
        sex
        image
        status
      }
    }
  `,
  SHELTER_ANALYTICS: gql`
    query ShelterAnalytics($shelterId: ID!) {
      shelterAnalytics(shelterId: $shelterId) {
        totalAnimals
        availableAnimals
        pendingAnimals
        adoptedAnimals
        adoptionRate
        totalApplications
        submittedApplications
        underReviewApplications
        approvedApplications
        rejectedApplications
        recentApplications
      }
    }
  `,
  SUCCESS_STORIES: gql`
    query SuccessStories {
      successStories {
        _id
        userId
        animalName
        animalType
        title
        story
        image
        createdAt
      }
    }
  `
};

export default queries;
