const jwt = require("jsonwebtoken");
const BlackListModel = require("../models/BlackList.model");
const userModel = require("../models/user.models");

async function authUser(req,res,next){

    const token = req.headers.authorization?.split(" ")[1] || req.headers.Authorization?.split(" ")[1] || req.cookies?.token;
    
    if(!token){
        return res.status(401).json({
            message: "Token not Provided."
        })
    }

    const blackListed = await BlackListModel.findOne({token})

    if(blackListed) {
        return res.status(401).json({
            message : "token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.jwt_secret)
        
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized. User account no longer exists."
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                message: "Forbidden. Your account has been suspended. Please contact support."
            });
        }

        // Asynchronously update lastActiveAt to keep it fresh without blocking the request pipeline
        userModel.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).catch(err => {
            console.error("Failed to update user lastActiveAt in authUser:", err.message);
        });

        req.user = {
            userId: user._id,
            role: user.role
        };
        next()
    }
    catch(err){
        return res.status(401).json({
            message : "Invalid token."
        })
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized. User authentication details not found."
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
            });
        }
        next();
    };
}

async function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized. User authentication details not found."
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: "Forbidden. Admin access required."
        });
    }
    next();
}

module.exports={
    authUser,
    authorizeRoles,
    isAdmin
}