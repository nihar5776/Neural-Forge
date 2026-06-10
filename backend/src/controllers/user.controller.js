const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const BlackListModel  = require("../models/BlackList.model");
const sessionModel = require("../models/session.model");


const userRegisterController = async (req,res)=>{
    try {
        const {email , password , name} = req.body;
        const isExists = await userModel.findOne({
            email:email
        })
        if(isExists){
           return res.status(422).json({
                status :"Failed",
                message : "User Already Exits With this Email"
            })
        }
        const user = await userModel.create({
            email,
            password,
            name,
            role: userModel.ROLES.USER // Prevent privilege escalation: default self-register to user
        })

       return res.status(201).json({
        status: "Success",
        user:{
            _id : user._id,
            email : user.email,
            name : user.name,
            role : user.role
        },
       })
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                status: "Failed",
                message: messages[0] || "Validation failed"
            });
        }
        console.error("Register Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: error.message || "Internal Server Error"
        });
    }
} 

const userloginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                status: "Failed",
                message: "No account on this email. Please Register first."
            });
        }

        const validPassword = await user.passwordCompare(password);

        if (!validPassword) {
            return res.status(401).json({
                status: "Failed",
                message: "Invalid Password"
            });
        }
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                jti: require("crypto").randomUUID()
            },
            process.env.jwt_secret,
            { expiresIn: '2h' }
        );
        
        // Log active session details
        const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || "Unknown";
        const userAgent = req.headers['user-agent'] || "Unknown";
        await sessionModel.create({
            user: user._id,
            token,
            ipAddress,
            userAgent
        }).catch(err => console.error("Failed to log active session:", err.message));

        res.cookie("token",token)

        return res.status(200).json({
            status: "Success",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: error.message || "Internal Server Error"
        });
    }
};


const userLogoutController = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    console.log(token)

    if (!token) {
        return res.status(403).json({
            status: "Failed", 
            message: "Please Login First"
        });
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });


    try {
        await BlackListModel.create({
            token
        });
    } catch (err) {
        if (err.code !== 11000) {
            console.error("Failed to blacklist token during logout:", err.message);
        }
    }

    // Set session status as inactive
    await sessionModel.findOneAndUpdate(
        { token },
        { active: false, logoutAt: new Date() }
    ).catch(err => console.error("Failed to mark session inactive during logout:", err.message));

    return res.status(200).json({
        status: "Success",
        message: "User Logout Successful" 
    });
};

async function getUserController(req, res) {
    // 1. Notice the change to req.user.userId to match your login token structure
    const userId = req.user.userId || req.user.id; 
    
    const user = await userModel.findById(userId);
    
    // 2. Add a safety check to handle null values gracefully
    if (!user) {
        return res.status(404).json({ 
            status: "Failed", 
            message: "User account no longer exists in the database." 
        });
    }

    res.status(200).json({ 
        message: "User details fetched successfully", 
        user: { 
            id: user._id, 
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences || { uiTheme: 'default' }
        } 
    });
}


async function updateUserProfile(req, res) {
    try {
        const userId = req.user.userId || req.user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                status: "Failed",
                message: "Name and email are required fields."
            });
        }

        const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
            return res.status(422).json({
                status: "Failed",
                message: "Email address is already in use by another account."
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            status: "Success",
            message: "Profile updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to update profile.",
            error: error.message
        });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.userId || req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: "Failed",
                message: "Current password and new password are required fields."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: "Failed",
                message: "New password must be at least 6 characters."
            });
        }

        const user = await userModel.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found."
            });
        }

        const isMatch = await user.passwordCompare(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                status: "Failed",
                message: "Incorrect current password."
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            status: "Success",
            message: "Password changed successfully."
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to change password.",
            error: error.message
        });
    }
}

async function getLoginHistory(req, res) {
    try {
        const userId = req.user.userId || req.user.id;
        
        const history = await sessionModel.find({ user: userId })
            .sort({ loginAt: -1 })
            .lean();

        return res.status(200).json({
            status: "Success",
            data: history
        });
    } catch (error) {
        console.error("Get Login History Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to retrieve login history.",
            error: error.message
        });
    }
}

async function getActiveSessions(req, res) {
    try {
        const userId = req.user.userId || req.user.id;

        const activeSessions = await sessionModel.find({ user: userId, active: true })
            .sort({ loginAt: -1 })
            .lean();

        return res.status(200).json({
            status: "Success",
            data: activeSessions
        });
    } catch (error) {
        console.error("Get Active Sessions Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to retrieve active sessions.",
            error: error.message
        });
    }
}

async function revokeSession(req, res) {
    try {
        const userId = req.user.userId || req.user.id;
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: "Failed",
                message: "sessionId parameter is required."
            });
        }

        const session = await sessionModel.findOne({ _id: sessionId, user: userId });
        if (!session) {
            return res.status(404).json({
                status: "Failed",
                message: "Session not found or unauthorized."
            });
        }

        session.active = false;
        session.logoutAt = new Date();
        await session.save();

        await BlackListModel.create({
            token: session.token
        }).catch(err => console.error("Failed to blacklist revoked token:", err.message));

        return res.status(200).json({
            status: "Success",
            message: "Session revoked and logged out successfully."
        });
    } catch (error) {
        console.error("Revoke Session Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to revoke active session.",
            error: error.message
        });
    }
}

async function updateUITheme(req, res) {
    try {
        const userId = req.user.userId || req.user.id;
        const { uiTheme } = req.body;

        const allowedThemes = ['default', 'cyberpunk'];
        if (!uiTheme || !allowedThemes.includes(uiTheme)) {
            return res.status(400).json({
                status: "Failed",
                message: `Invalid uiTheme value. Allowed values: ${allowedThemes.join(', ')}.`
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { 'preferences.uiTheme': uiTheme },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found."
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "UI theme preference updated successfully.",
            uiTheme: updatedUser.preferences?.uiTheme || 'default'
        });
    } catch (error) {
        console.error("Update UI Theme Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to update UI theme preference.",
            error: error.message
        });
    }
}

module.exports = {
    userRegisterController,
    userloginController,
    userLogoutController,
    getUserController,
    updateUserProfile,
    changePassword,
    getLoginHistory,
    getActiveSessions,
    revokeSession,
    updateUITheme
};
