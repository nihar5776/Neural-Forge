const mongoose=require("mongoose");

const resumeSchema=new mongoose.Schema(
    {
      resume:{
        type:String,
        required:[true,"The resume should be given"]
      },
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    },{
        timestamps:true
    }
)

const resumeModel=mongoose.model("Resume",resumeSchema);

module.exports={resumeModel};