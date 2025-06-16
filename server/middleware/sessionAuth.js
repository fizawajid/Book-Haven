const sessionAuth = (req, res, next) => {
  // Check if we have a valid session
  if (!req.session || !req.session.reader_id) {
    // If no session, check if we have a valid user from auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized - Please log in" });
    }
    
    // If we have a valid user but no session, create one
    req.session.reader_id = req.user.id;
  }
  
  next(); // Continue to the next middleware or route handler
};

module.exports = sessionAuth;