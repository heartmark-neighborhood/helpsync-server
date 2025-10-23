/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";


if (!admin.apps.length) {
  admin.initializeApp();
}

setGlobalOptions({
  region: "asia-northeast1",
});

export * from "./infrastructure/functions/create-help-request.function.js";
export * from "./infrastructure/functions/complete-help-request.function.js";
export * from "./infrastructure/functions/handle-proximity-verification-result.function.js";
export * from "./infrastructure/functions/on-proximity-verification-timeout.function.js";
export * from "./infrastructure/functions/update-device-location.function.js";
export * from "./infrastructure/functions/renew-device-token.function.js";
export * from "./infrastructure/functions/register-new-device.function.js";
export * from "./infrastructure/functions/delete-device.function.js";
