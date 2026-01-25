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
  CREATE_APPLICATION_TEMPLATE: DocumentNode;
  DELETE_APPLICATION_TEMPLATE: DocumentNode;
  VERIFY_SHELTER: DocumentNode;
  LOG_ACTIVITY: DocumentNode;
  REGISTER_TERMINAL_READER: DocumentNode;
  DELETE_TERMINAL_READER: DocumentNode;
  CREATE_TERMINAL_PAYMENT_INTENT: DocumentNode;
  SEND_MESSAGE: DocumentNode;
  MARK_MESSAGES_READ: DocumentNode;
  ADD_BEHAVIOR_NOTE: DocumentNode;
  RESOLVE_BEHAVIOR_NOTE: DocumentNode;
  CREATE_ANNOUNCEMENT: DocumentNode;
  TOGGLE_ANNOUNCEMENT_PIN: DocumentNode;
  DELETE_ANNOUNCEMENT: DocumentNode;
  ADD_VOLUNTEER: DocumentNode;
  UPDATE_VOLUNTEER_STATUS: DocumentNode;
  LOG_VOLUNTEER_HOURS: DocumentNode;
  REGISTER_MICROCHIP: DocumentNode;
  UPDATE_MICROCHIP_STATUS: DocumentNode;
  ADD_WEIGHT_RECORD: DocumentNode;
  DELETE_WEIGHT_RECORD: DocumentNode;
  ADD_VACCINATION: DocumentNode;
  UPDATE_VACCINATION_STATUS: DocumentNode;
  CREATE_ADOPTION_FEE: DocumentNode;
  UPDATE_ADOPTION_FEE: DocumentNode;
  SET_ADOPTION_FEE: DocumentNode;
  UPDATE_ADOPTION_FEE_STATUS: DocumentNode;
  WAIVE_ADOPTION_FEE: DocumentNode;
  UPDATE_SPAY_NEUTER: DocumentNode;
  SCHEDULE_SPAY_NEUTER: DocumentNode;
  UPDATE_SPAY_NEUTER_STATUS: DocumentNode;
  CREATE_INTAKE_LOG: DocumentNode;
  CREATE_OUTCOME_LOG: DocumentNode;
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
  `,
  CREATE_APPLICATION_TEMPLATE: gql`
    mutation CreateApplicationTemplate(
      $shelterId: ID!
      $name: String!
      $fields: [TemplateFieldInput]
    ) {
      createApplicationTemplate(
        shelterId: $shelterId
        name: $name
        fields: $fields
      ) {
        _id
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
  DELETE_APPLICATION_TEMPLATE: gql`
    mutation DeleteApplicationTemplate($_id: ID!) {
      deleteApplicationTemplate(_id: $_id) {
        _id
      }
    }
  `,
  VERIFY_SHELTER: gql`
    mutation VerifyShelter($shelterId: ID!, $verified: Boolean!) {
      verifyShelter(shelterId: $shelterId, verified: $verified) {
        _id
        verified
        verifiedAt
      }
    }
  `,
  LOG_ACTIVITY: gql`
    mutation LogActivity(
      $shelterId: ID!
      $action: String!
      $entityType: String!
      $entityId: String
      $description: String!
    ) {
      logActivity(
        shelterId: $shelterId
        action: $action
        entityType: $entityType
        entityId: $entityId
        description: $description
      ) {
        _id
        action
        entityType
        description
        createdAt
      }
    }
  `,
  REGISTER_TERMINAL_READER: gql`
    mutation RegisterTerminalReader(
      $shelterId: ID!
      $registrationCode: String!
      $label: String!
      $location: String
    ) {
      registerTerminalReader(
        shelterId: $shelterId
        registrationCode: $registrationCode
        label: $label
        location: $location
      ) {
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
  DELETE_TERMINAL_READER: gql`
    mutation DeleteTerminalReader($_id: ID!) {
      deleteTerminalReader(_id: $_id) {
        _id
      }
    }
  `,
  CREATE_TERMINAL_PAYMENT_INTENT: gql`
    mutation CreateTerminalPaymentIntent(
      $shelterId: ID!
      $readerId: String!
      $amount: Int!
      $currency: String
      $description: String
    ) {
      createTerminalPaymentIntent(
        shelterId: $shelterId
        readerId: $readerId
        amount: $amount
        currency: $currency
        description: $description
      ) {
        id
        amount
        currency
        status
        description
        clientSecret
      }
    }
  `,
  SEND_MESSAGE: gql`
    mutation SendMessage(
      $senderId: String!
      $recipientId: String!
      $shelterId: String!
      $content: String!
    ) {
      sendMessage(
        senderId: $senderId
        recipientId: $recipientId
        shelterId: $shelterId
        content: $content
      ) {
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
  MARK_MESSAGES_READ: gql`
    mutation MarkMessagesRead($shelterId: String!, $userId: String!, $readerId: String!) {
      markMessagesRead(shelterId: $shelterId, userId: $userId, readerId: $readerId)
    }
  `,
  ADD_VOLUNTEER: gql`
    mutation AddVolunteer(
      $shelterId: ID!
      $name: String!
      $email: String
      $phone: String
      $skills: [String]
      $availability: String
      $notes: String
    ) {
      addVolunteer(
        shelterId: $shelterId
        name: $name
        email: $email
        phone: $phone
        skills: $skills
        availability: $availability
        notes: $notes
      ) {
        _id
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
  UPDATE_VOLUNTEER_STATUS: gql`
    mutation UpdateVolunteerStatus($_id: ID!, $status: String!) {
      updateVolunteerStatus(_id: $_id, status: $status) {
        _id
        status
      }
    }
  `,
  LOG_VOLUNTEER_HOURS: gql`
    mutation LogVolunteerHours($_id: ID!, $hours: Int!) {
      logVolunteerHours(_id: $_id, hours: $hours) {
        _id
        totalHours
      }
    }
  `,
  ADD_BEHAVIOR_NOTE: gql`
    mutation AddBehaviorNote(
      $animalId: ID!
      $shelterId: ID!
      $noteType: String!
      $severity: String!
      $content: String!
      $author: String
    ) {
      addBehaviorNote(
        animalId: $animalId
        shelterId: $shelterId
        noteType: $noteType
        severity: $severity
        content: $content
        author: $author
      ) {
        _id
        animalId
        shelterId
        noteType
        severity
        content
        author
        resolved
        createdAt
      }
    }
  `,
  RESOLVE_BEHAVIOR_NOTE: gql`
    mutation ResolveBehaviorNote($_id: ID!) {
      resolveBehaviorNote(_id: $_id) {
        _id
        resolved
        resolvedAt
      }
    }
  `,
  CREATE_ANNOUNCEMENT: gql`
    mutation CreateAnnouncement(
      $shelterId: ID!
      $title: String!
      $content: String!
      $category: String!
      $author: String
    ) {
      createAnnouncement(
        shelterId: $shelterId
        title: $title
        content: $content
        category: $category
        author: $author
      ) {
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
  TOGGLE_ANNOUNCEMENT_PIN: gql`
    mutation ToggleAnnouncementPin($_id: ID!) {
      toggleAnnouncementPin(_id: $_id) {
        _id
        pinned
      }
    }
  `,
  DELETE_ANNOUNCEMENT: gql`
    mutation DeleteAnnouncement($_id: ID!) {
      deleteAnnouncement(_id: $_id) {
        _id
      }
    }
  `,
  REGISTER_MICROCHIP: gql`
    mutation RegisterMicrochip($animalId: ID!, $shelterId: ID!, $chipNumber: String!, $manufacturer: String) {
      registerMicrochip(animalId: $animalId, shelterId: $shelterId, chipNumber: $chipNumber, manufacturer: $manufacturer) {
        _id
        animalId
        chipNumber
        manufacturer
        status
        createdAt
      }
    }
  `,
  UPDATE_MICROCHIP_STATUS: gql`
    mutation UpdateMicrochipStatus($_id: ID!, $status: String!) {
      updateMicrochipStatus(_id: $_id, status: $status) {
        _id
        status
      }
    }
  `,
  ADD_WEIGHT_RECORD: gql`
    mutation AddWeightRecord($animalId: ID!, $shelterId: ID!, $weight: Float!, $unit: String!, $notes: String) {
      addWeightRecord(animalId: $animalId, shelterId: $shelterId, weight: $weight, unit: $unit, notes: $notes) {
        _id
        animalId
        weight
        unit
        notes
        recordedAt
      }
    }
  `,
  ADD_VACCINATION: gql`
    mutation AddVaccination($animalId: ID!, $shelterId: ID!, $vaccineName: String!, $dateAdministered: String!, $nextDueDate: String, $veterinarian: String, $notes: String) {
      addVaccination(animalId: $animalId, shelterId: $shelterId, vaccineName: $vaccineName, dateAdministered: $dateAdministered, nextDueDate: $nextDueDate, veterinarian: $veterinarian, notes: $notes) {
        _id
        animalId
        vaccineName
        dateAdministered
        status
      }
    }
  `,
  UPDATE_VACCINATION_STATUS: gql`
    mutation UpdateVaccinationStatus($_id: ID!, $status: String!) {
      updateVaccinationStatus(_id: $_id, status: $status) {
        _id
        status
      }
    }
  `,
  CREATE_ADOPTION_FEE: gql`
    mutation CreateAdoptionFee($shelterId: ID!, $animalType: String!, $baseFee: Float!, $seniorDiscount: Float, $specialNeedsDiscount: Float, $description: String) {
      createAdoptionFee(shelterId: $shelterId, animalType: $animalType, baseFee: $baseFee, seniorDiscount: $seniorDiscount, specialNeedsDiscount: $specialNeedsDiscount, description: $description) {
        _id
        animalType
        baseFee
        active
      }
    }
  `,
  UPDATE_ADOPTION_FEE: gql`
    mutation UpdateAdoptionFee($_id: ID!, $baseFee: Float, $seniorDiscount: Float, $specialNeedsDiscount: Float, $active: Boolean) {
      updateAdoptionFee(_id: $_id, baseFee: $baseFee, seniorDiscount: $seniorDiscount, specialNeedsDiscount: $specialNeedsDiscount, active: $active) {
        _id
        baseFee
        active
      }
    }
  `,
  UPDATE_SPAY_NEUTER: gql`
    mutation UpdateSpayNeuter($animalId: ID!, $shelterId: ID!, $status: String!, $scheduledDate: String, $completedDate: String, $veterinarian: String, $notes: String) {
      updateSpayNeuter(animalId: $animalId, shelterId: $shelterId, status: $status, scheduledDate: $scheduledDate, completedDate: $completedDate, veterinarian: $veterinarian, notes: $notes) {
        _id
        animalId
        status
        scheduledDate
        completedDate
      }
    }
  `,
  CREATE_INTAKE_LOG: gql`
    mutation CreateIntakeLog($animalId: ID!, $shelterId: ID!, $intakeType: String!, $intakeDate: String!, $source: String, $condition: String, $notes: String, $createdBy: String) {
      createIntakeLog(animalId: $animalId, shelterId: $shelterId, intakeType: $intakeType, intakeDate: $intakeDate, source: $source, condition: $condition, notes: $notes, createdBy: $createdBy) {
        _id
        animalId
        intakeType
        intakeDate
      }
    }
  `,
  CREATE_OUTCOME_LOG: gql`
    mutation CreateOutcomeLog($animalId: ID!, $shelterId: ID!, $outcomeType: String!, $outcomeDate: String!, $destination: String, $notes: String, $createdBy: String) {
      createOutcomeLog(animalId: $animalId, shelterId: $shelterId, outcomeType: $outcomeType, outcomeDate: $outcomeDate, destination: $destination, notes: $notes, createdBy: $createdBy) {
        _id
        animalId
        outcomeType
        outcomeDate
      }
    }
  `,
  DELETE_WEIGHT_RECORD: gql`
    mutation DeleteWeightRecord($_id: ID!) {
      deleteWeightRecord(_id: $_id) {
        _id
      }
    }
  `,
  SET_ADOPTION_FEE: gql`
    mutation SetAdoptionFee($animalId: ID!, $shelterId: ID!, $amount: Float!, $currency: String, $description: String) {
      setAdoptionFee(animalId: $animalId, shelterId: $shelterId, amount: $amount, currency: $currency, description: $description) {
        _id
        animalId
        amount
        currency
        status
      }
    }
  `,
  UPDATE_ADOPTION_FEE_STATUS: gql`
    mutation UpdateAdoptionFeeStatus($_id: ID!, $status: String!, $paidBy: String) {
      updateAdoptionFeeStatus(_id: $_id, status: $status, paidBy: $paidBy) {
        _id
        status
        paidBy
      }
    }
  `,
  WAIVE_ADOPTION_FEE: gql`
    mutation WaiveAdoptionFee($_id: ID!, $waivedReason: String) {
      waiveAdoptionFee(_id: $_id, waivedReason: $waivedReason) {
        _id
        status
        waived
        waivedReason
      }
    }
  `,
  SCHEDULE_SPAY_NEUTER: gql`
    mutation ScheduleSpayNeuter($animalId: ID!, $shelterId: ID!, $scheduledDate: String!, $veterinarian: String, $notes: String) {
      scheduleSpayNeuter(animalId: $animalId, shelterId: $shelterId, scheduledDate: $scheduledDate, veterinarian: $veterinarian, notes: $notes) {
        _id
        animalId
        status
        scheduledDate
      }
    }
  `,
  UPDATE_SPAY_NEUTER_STATUS: gql`
    mutation UpdateSpayNeuterStatus($_id: ID!, $status: String!, $completedDate: String) {
      updateSpayNeuterStatus(_id: $_id, status: $status, completedDate: $completedDate) {
        _id
        status
        completedDate
      }
    }
  `
};

export default mutations;
