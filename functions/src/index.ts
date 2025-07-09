/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export {createHelpRequest} from "./infrastructure/functions/create-help-request.function";
export {completeHelpRequest} from "./infrastructure/functions/complete-help-request.functions";
export {handleProximityVerificationResult} from "./infrastructure/functions/handle-proximity-verification-result.function";
export {onProximityVerificationTimeout} from "./infrastructure/functions/on-proximity-verification-timeout.function";
export {updateDeviceLocation} from "./infrastructure/functions/update-device-location.function";
