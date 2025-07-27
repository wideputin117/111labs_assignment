import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    otp:{type:Number, required:true},
    email:{type:String, required:true},
    type: {
        type: String,
        default: "REGISTER",
        enum: ["REGISTER", "FORGOT_PASSWORD"],
    },
    createdAt:{type: Date, default:Date.now()}
});

OtpSchema.index({
    createdAt:1
},{
    expireAfterSeconds:240
})

export const OTP = mongoose.model('OTP',OtpSchema)