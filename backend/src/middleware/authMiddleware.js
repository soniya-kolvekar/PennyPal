const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT using Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ 
      success: false, 
      message: "Unauthorized: Invalid token" 
    });
  }
};

module.exports = authMiddleware;
