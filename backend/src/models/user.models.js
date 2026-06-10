const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

const userSchema = new mongoose.Schema(
    {
     email: {
        type: String,
        required: [true, "Email Id Is Mandatory for User Registration"],
        trim: true,
        lowercase: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Please Enter a valid email address."],
        unique: [true, "Email Already Exists"]
    },

    name: {
        type: String,
        required: [true, "Name is Mandatory for creating User Account"],
        match: [/^[a-zA-Z0-9\s]+$/, "Name must not contain special characters"],
        minlength: [3, "Name must be at least 3 characters"]
    },

    password: {
        type: String,
        required: [true, "Password required For Creating a User"],
        minlength: [6, "Password Must contain Atleast 6 Characters"],
        select: false
    },

    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER
    },

    lastActiveAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    },

    preferences: {
        uiTheme: {
            type: String,
            enum: ['default', 'cyberpunk'],
            default: 'default'
        }
    },
    },
    {
       timestamps: true  
    }
);

userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return;
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;
});

userSchema.methods.passwordCompare = async function (password) {
    console.log(password,)
    return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user',userSchema);
mongoose.model('users', userSchema); // Register alias to resolve populate references to plural 'users'
userModel.ROLES = ROLES;

module.exports = userModel;