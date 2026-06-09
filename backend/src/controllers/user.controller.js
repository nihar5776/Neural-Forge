const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const BlackListModel  = require("../models/BlackList.model")


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
            email,password,name
        })

       return res.status(201).json({
        status: "Success",
        user:{
            _id : user._id,
            email : user.email,
            name : user.name
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
        const token = jwt.sign({userId:user._id},process.env.jwt_secret,{expiresIn :'2h'})
        res.cookie("token",token)

        return res.status(200).json({
            status: "Success",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
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
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
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


    await  BlackListModel.create({
        token
    })  
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
            email: user.email 
        } 
    });
}


module.exports = {
    userRegisterController,
    userloginController,
    userLogoutController,
    getUserController
}
