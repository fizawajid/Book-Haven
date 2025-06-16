const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // First check if we have a valid session
  if (req.session && req.session.reader_id) {
    req.user = { 
      id: req.session.reader_id,
      isAdmin: req.session.isAdmin || false
    };
    return next();
  }

  // If no session, check for token in Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If no token is provided, return an error
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token and extract decoded information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to the request object
    
    // Update session with token info if not already set
    if (!req.session.reader_id) {
      req.session.reader_id = decoded.id;
      req.session.token = token;
      req.session.isAdmin = decoded.isAdmin || false;
    }
    
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = auth;
