/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export * from "./infrastructure/functions/create-help-request.function.js";
export * from "./infrastructure/functions/complete-help-request.function.js";
export * from "./infrastructure/functions/handle-proximity-verification-result.function.js";
export * from "./infrastructure/functions/on-proximity-verification-timeout.function.js";
export * from "./infrastructure/functions/update-device-location.function.js";
