# Firestore Database Design

This document outlines the database design for the project, based on the analysis of the Firestore repositories.

## Collection Overview

The database consists of three main top-level collections:

1.  **`users`**: Stores information about the application's users.
2.  **`devices`**: Stores information about user devices, such as smartphones.
3.  **`helpRequests`**: Stores information related to help requests from users.

---

### 1. `users` Collection

Manages user profile information.

*   **Document ID**: `UserId` (Unique user ID)
*   **Fields**:
    *   `nickname`: (string) User's nickname
    *   `email`: (string) User's email address
    *   `role`: (string) User's role (`supporter` or `requester`)
    *   `isAvailableForHelp`: (boolean) Whether the user is available to provide help
    *   `iconUrl`: (string) URL of the user's profile picture
    *   `physicalFeatures`: (string) User's physical features
    *   `createdAt`: (Timestamp) Timestamp of creation
    *   `updatedAt`: (Timestamp) Timestamp of last update

### 2. `devices` Collection

Manages user device information, particularly location and notification tokens.

*   **Document ID**: `DeviceId` (Unique device ID)
*   **Fields**:
    *   `ownerId`: (string) ID of the user who owns this device (reference to the `users` collection)
    *   `fcmToken`: (string) Device token for Firebase Cloud Messaging (FCM)
    *   `location`: (GeoPoint) Current latitude and longitude of the device
    *   `geohash`: (string) Geohash value to speed up location-based searches
    *   `lastUpdatedAt`: (Timestamp) Timestamp of the last update

**Key Point**: The `geohash` field is used with the `geofire-common` library to efficiently search for devices within a certain radius of a specific point (as seen in the `findAvailableNearBy` method).

### 3. `helpRequests` Collection

This is the central collection that manages the entire lifecycle of a help request.

*   **Document ID**: `HelpRequestId` (Unique help request ID)
*   **Fields**:
    *   `requesterId`: (string) ID of the user who requested help (reference to the `users` collection)
    *   `requesterInfo`: (object) A snapshot of the requester's information (denormalized data)
        *   Includes `id`, `nickname`, `iconUrl`, `deviceId`, `physicalDescription`
    *   `status`: (string) The current status of the request (e.g., `pending`, `completed`)
    *   `location`: (GeoPoint) The location where help was requested
    *   `proximityVerificationId`: (string) A unique ID for proximity verification
    *   `proximityCheckDeadline`: (Timestamp) The expiration time for the proximity check
    *   `createdAt`: (Timestamp) Timestamp of creation
    *   `updatedAt`: (Timestamp) Timestamp of last update

#### `helpRequests` Subcollection: `candidates`

Manages information about potential supporters (candidates) for each help request.

*   **Location**: `/helpRequests/{helpRequestId}/candidates/{userId}`
*   **Document ID**: The `UserId` of the candidate
*   **Fields**:
    *   `id`: (string) The candidate's `UserId`
    *   `nickname`: (string) The candidate's nickname
    *   `iconUrl`: (string) The candidate's icon URL
    *   `physicalDescription`: (string) The candidate's physical features
    *   `deviceId`: (string) The candidate's `DeviceId`
    *   `status`: (string) The status of the candidate (e.g., `notified`, `accepted`)

---

### Design Summary

*   **Balance of Normalization and Denormalization**: By embedding some user information (`requesterInfo`) in `helpRequests` (denormalization), the system avoids having to look up the `users` collection every time it displays help request details, thus improving read performance.
*   **Use of Subcollections**: Placing `candidates` under `helpRequests` clearly models the relationship between a help request and the candidates responding to it.
*   **Optimization of Location-Based Searches**: Storing a `geohash` in the `devices` collection and combining it with the `geofire-common` library enables scalable nearby searches.

This design allows for the efficient management of the entire process, from the creation of a help request to matching with candidates and its resolution.
