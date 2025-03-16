const jwt = require("jsonwebtoken");
const { User } = require('../models/association');


module.exports = async (req, res, next) => {
    try {
        // Get token from headers
        const token = req.header("Authorization").split(" ")[1];

        console.log(token)

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, "MY_SECRET_KEY"); 
        console.log("decoded",decoded)

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token." });
        }

        // Attach userId to the request
        req.userId = decoded.userId;

        // Optional: Fetch user from DB (if needed)
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = user; // Attach user object to request
       
        next(); // Pass control to the next middleware
    } catch (err) {
        console.error("JWT Verification Error:", err);
        res.status(401).json({ message: "Invalid or expired token." });
    }
};
