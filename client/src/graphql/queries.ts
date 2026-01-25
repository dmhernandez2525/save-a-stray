import { gql, DocumentNode } from "@apollo/client";

interface Queries {
  IS_LOGGED_IN: DocumentNode;
  USER_ID: DocumentNode;
  FETCH_USER: DocumentNode;
  FETCH_SHELTER: DocumentNode;
  SHELTER_APPLICATIONS: DocumentNode;
  SHELTER_ANALYTICS: DocumentNode;
  SHELTER_STAFF: DocumentNode;
  SHELTER_EVENTS: DocumentNode;
  SHELTER_DONATIONS: DocumentNode;
  SHELTER_FOSTERS: DocumentNode;
  USER_SAVED_SEARCHES: DocumentNode;
  SHELTER_APPLICATION_TEMPLATES: DocumentNode;
  SHELTER_ACTIVITY_LOG: DocumentNode;
  SHELTER_TERMINAL_READERS: DocumentNode;
  CONVERSATION_MESSAGES: DocumentNode;
  SHELTER_CONVERSATIONS: DocumentNode;
  USER_CONVERSATIONS: DocumentNode;
  PLATFORM_STATS: DocumentNode;
  USER_APPLICATIONS: DocumentNode;
  FIND_ANIMALS: DocumentNode;
  FETCH_ANIMAL: DocumentNode;
  SIMILAR_ANIMALS: DocumentNode;
  SHELTER_REVIEWS: DocumentNode;
  USER_NOTIFICATIONS: DocumentNode;
  USER_FAVORITES: DocumentNode;
  USER_FAVORITE_IDS: DocumentNode;
  SUCCESS_STORIES: DocumentNode;
  SHELTER_BEHAVIOR_NOTES: DocumentNode;
  SHELTER_ANNOUNCEMENTS: DocumentNode;
  SHELTER_MICROCHIPS: DocumentNode;
  ANIMAL_WEIGHT_RECORDS: DocumentNode;
  SHELTER_WEIGHT_RECORDS: DocumentNode;
  ANIMAL_VACCINATIONS: DocumentNode;
  SHELTER_VACCINATIONS: DocumentNode;
  SHELTER_ADOPTION_FEES: DocumentNode;
  ANIMAL_SPAY_NEUTER: DocumentNode;
  SHELTER_SPAY_NEUTER: DocumentNode;
  ANIMAL_INTAKE_LOGS: DocumentNode;
  SHELTER_INTAKE_LOGS: DocumentNode;
  ANIMAL_OUTCOME_LOGS: DocumentNode;
  SHELTER_OUTCOME_LOGS: DocumentNode;
  SHELTER_VOLUNTEERS: DocumentNode;
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
        verified
        verifiedAt
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
  SHELTER_STAFF: gql`
    query ShelterStaff($shelterId: ID!) {
      shelterStaff(shelterId: $shelterId) {
        _id
        name
        email
      }
    }
  `,
  SHELTER_EVENTS: gql`
    query ShelterEvents($shelterId: ID!) {
      shelterEvents(shelterId: $shelterId) {
        _id
        title
        description
        date
        endDate
        location
        eventType
      }
    }
  `,
  SHELTER_DONATIONS: gql`
    query ShelterDonations($shelterId: ID!) {
      shelterDonations(shelterId: $shelterId) {
        _id
        donorName
        amount
        message
        createdAt
      }
    }
  `,
  USER_SAVED_SEARCHES: gql`
    query UserSavedSearches($userId: ID!) {
      userSavedSearches(userId: $userId) {
        _id
        userId
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
  SHELTER_FOSTERS: gql`
    query ShelterFosters($shelterId: ID!) {
      shelterFosters(shelterId: $shelterId) {
        _id
        shelterId
        animalId
        userId
        fosterName
        fosterEmail
        startDate
        endDate
        status
        notes
        createdAt
      }
    }
  `,
  SHELTER_APPLICATION_TEMPLATES: gql`
    query ShelterApplicationTemplates($shelterId: ID!) {
      shelterApplicationTemplates(shelterId: $shelterId) {
        _id
        shelterId
        name
        fields {
          label
          fieldType
          required
          options
        }
        createdAt
      }
    }
  `,
  SHELTER_ACTIVITY_LOG: gql`
    query ShelterActivityLog($shelterId: ID!, $limit: Int) {
      shelterActivityLog(shelterId: $shelterId, limit: $limit) {
        _id
        shelterId
        action
        entityType
        entityId
        description
        createdAt
      }
    }
  `,
  SHELTER_TERMINAL_READERS: gql`
    query ShelterTerminalReaders($shelterId: ID!) {
      shelterTerminalReaders(shelterId: $shelterId) {
        _id
        shelterId
        stripeReaderId
        label
        deviceType
        serialNumber
        location
        status
        registeredAt
      }
    }
  `,
  CONVERSATION_MESSAGES: gql`
    query ConversationMessages($userId: ID!, $shelterId: ID!) {
      conversationMessages(userId: $userId, shelterId: $shelterId) {
        _id
        senderId
        recipientId
        shelterId
        content
        read
        createdAt
      }
    }
  `,
  SHELTER_CONVERSATIONS: gql`
    query ShelterConversations($shelterId: ID!) {
      shelterConversations(shelterId: $shelterId) {
        _id
        senderId
        recipientId
        shelterId
        content
        read
        createdAt
      }
    }
  `,
  USER_CONVERSATIONS: gql`
    query UserConversations($userId: ID!) {
      userConversations(userId: $userId) {
        _id
        senderId
        recipientId
        shelterId
        content
        read
        createdAt
      }
    }
  `,
  PLATFORM_STATS: gql`
    query PlatformStats {
      platformStats {
        totalUsers
        totalShelters
        totalAnimals
        totalApplications
        availableAnimals
        adoptedAnimals
        totalDonations
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
  SHELTER_VOLUNTEERS: gql`
    query ShelterVolunteers($shelterId: ID!) {
      shelterVolunteers(shelterId: $shelterId) {
        _id
        shelterId
        userId
        name
        email
        phone
        skills
        availability
        status
        startDate
        totalHours
        notes
        createdAt
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
  `,
  SHELTER_BEHAVIOR_NOTES: gql`
    query ShelterBehaviorNotes($shelterId: ID!) {
      shelterBehaviorNotes(shelterId: $shelterId) {
        _id
        animalId
        shelterId
        noteType
        severity
        content
        author
        resolved
        resolvedAt
        createdAt
      }
    }
  `,
  SHELTER_ANNOUNCEMENTS: gql`
    query ShelterAnnouncements($shelterId: ID!) {
      shelterAnnouncements(shelterId: $shelterId) {
        _id
        shelterId
        title
        content
        category
        author
        pinned
        active
        createdAt
      }
    }
  `,
  SHELTER_MICROCHIPS: gql`
    query ShelterMicrochips($shelterId: ID!) {
      shelterMicrochips(shelterId: $shelterId) {
        _id
        animalId
        shelterId
        chipNumber
        manufacturer
        registrationDate
        status
        createdAt
      }
    }
  `,
  ANIMAL_WEIGHT_RECORDS: gql`
    query AnimalWeightRecords($animalId: ID!) {
      animalWeightRecords(animalId: $animalId) {
        _id
        animalId
        weight
        unit
        notes
        recordedAt
        createdAt
      }
    }
  `,
  ANIMAL_VACCINATIONS: gql`
    query AnimalVaccinations($animalId: ID!) {
      animalVaccinations(animalId: $animalId) {
        _id
        animalId
        vaccineName
        dateAdministered
        nextDueDate
        veterinarian
        status
        notes
        createdAt
      }
    }
  `,
  SHELTER_ADOPTION_FEES: gql`
    query ShelterAdoptionFees($shelterId: ID!) {
      shelterAdoptionFees(shelterId: $shelterId) {
        _id
        shelterId
        animalType
        baseFee
        seniorDiscount
        specialNeedsDiscount
        description
        active
        createdAt
      }
    }
  `,
  ANIMAL_SPAY_NEUTER: gql`
    query AnimalSpayNeuter($animalId: ID!) {
      animalSpayNeuter(animalId: $animalId) {
        _id
        animalId
        status
        scheduledDate
        completedDate
        veterinarian
        notes
        createdAt
      }
    }
  `,
  ANIMAL_INTAKE_LOGS: gql`
    query AnimalIntakeLogs($shelterId: ID!) {
      animalIntakeLogs(shelterId: $shelterId) {
        _id
        animalId
        intakeType
        intakeDate
        source
        condition
        notes
        createdBy
        createdAt
      }
    }
  `,
  ANIMAL_OUTCOME_LOGS: gql`
    query AnimalOutcomeLogs($shelterId: ID!) {
      animalOutcomeLogs(shelterId: $shelterId) {
        _id
        animalId
        outcomeType
        outcomeDate
        destination
        notes
        createdBy
        createdAt
      }
    }
  `,
  SHELTER_WEIGHT_RECORDS: gql`
    query ShelterWeightRecords($shelterId: ID!) {
      shelterWeightRecords(shelterId: $shelterId) {
        _id
        animalId
        weight
        unit
        notes
        recordedBy
        recordedAt
        createdAt
      }
    }
  `,
  SHELTER_VACCINATIONS: gql`
    query ShelterVaccinations($shelterId: ID!) {
      shelterVaccinations(shelterId: $shelterId) {
        _id
        animalId
        vaccineName
        dateAdministered
        administeredDate
        administeredBy
        nextDueDate
        expirationDate
        batchNumber
        veterinarian
        status
        notes
        createdAt
      }
    }
  `,
  SHELTER_SPAY_NEUTER: gql`
    query ShelterSpayNeuter($shelterId: ID!) {
      shelterSpayNeuter(shelterId: $shelterId) {
        _id
        animalId
        status
        scheduledDate
        completedDate
        veterinarian
        notes
        createdAt
      }
    }
  `,
  SHELTER_INTAKE_LOGS: gql`
    query ShelterIntakeLogs($shelterId: ID!) {
      shelterIntakeLogs(shelterId: $shelterId) {
        _id
        animalId
        intakeType
        intakeDate
        source
        condition
        notes
        intakeNotes
        receivedBy
        createdBy
        createdAt
      }
    }
  `,
  SHELTER_OUTCOME_LOGS: gql`
    query ShelterOutcomeLogs($shelterId: ID!) {
      shelterOutcomeLogs(shelterId: $shelterId) {
        _id
        animalId
        outcomeType
        outcomeDate
        destination
        condition
        notes
        processedBy
        createdBy
        createdAt
      }
    }
  `
};

export default queries;
