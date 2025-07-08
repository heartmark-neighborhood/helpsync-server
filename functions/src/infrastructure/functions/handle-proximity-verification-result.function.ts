import { https } from "firebase-functions";

export const handleProximityVerificationResult = https.onCall(async (request) => {
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "Unauthorized request");
  }
  console.log("Proximity verification result received:", request.data);

  return { success: true, message: "Proximity verification result processed successfully." };
});
