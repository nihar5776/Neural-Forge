const { resumeModel } = require("../models/resume.model");
const userModel = require("../models/user.models");
const pdfParse = require("pdf-parse");

async function resumeUpload(req,res){
   const resume = req.file;
   
    if (!resume) {
       return res.status(400).json({
         message: "Resume file is required"
       });
    }
    const pdfData = await pdfParse(resume.buffer);
    const userId = req.user.userId || req.user.id; 
         
    const user = await userModel.findById(userId);
         
    if (!user) {
        return res.status(404).json({ 
            status: "Failed", 
            message: "User account no longer exists in the database." 
        });
    }
    const response=await resumeModel.create({
        resume: pdfData.text,
        user: user._id
    });

    res.status(201).json({
    status: "Successful",
    response
    });

   
}
module.exports={resumeUpload};