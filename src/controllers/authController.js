import { COOKIE_OPTIONS } from "../../constants.js";
import { OTP } from "../models/Otp.js";
import { User } from "../models/User.js";
import { sendPasswordResetOTPOnMail, sendRegistrationOTPOnMail } from "../utils/email/emailTemplate.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import { generateOTP } from "../utils/generateOtp.js";
import jwt from 'jsonwebtoken' 
import * as arctic from "arctic";
import { ACCESS_TOKEN_EXPIRY, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, OAUTH_EXCHANGE_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../configs/env_constants.js";
const clientId= GOOGLE_CLIENT_ID;
const clientSecret= GOOGLE_CLIENT_SECRET
const redirectURI = GOOGLE_REDIRECT_URI

export const signup_controller = asyncHandler(async(req, res, next)=>{
   const {name,email, phoneNumber, role, password} = req.body;
   console.log("the request body is", req.body)
   const otp = generateOTP()
   if(!name,!email,!phoneNumber,!role,!password){
    return next(new ApiError('Invalid Fields',400))
   }
   const existingUser = await User.findOne({ email })
   try {
    if (existingUser) {
               if(existingUser?.isVerified){
               return next(new ApiError('User Already Exist', 400))
               }
               await sendRegistrationOTPOnMail(email, { name, otp })
                await OTP.findOneAndReplace(
                { email, type: "REGISTER" },
                { otp, email, type: "REGISTER" },
                { upsert: true, new: true } // upsert: Creates a new document if no match is found., new: returns updated doc
            );

            return res.status(200).json({
                success: true,
                message: "OTP resent successfully. Please verify your email.",
            });
     }
     /** for new user */
    await sendRegistrationOTPOnMail(email, {
        name,
        otp
    });
    await OTP.create({
        otp,
        email,
        type: "REGISTER",
    });
    await User.create({
        ...req?.body,
        isVerified : false
    }); // thsi will through error if user creation fails
    res.status(201).json({
        success: true,
        message: "OTP sent successfully. Please verify your email.",
    });
    }
    catch (error) {
        console.error("Error Sending OTP:", error);
        return next(new ApiError(`Failed to send OTP: ${error.message}`, 400));
    }
})

export const verifyOTP = asyncHandler(async (req, res, next) => {
    const {
        email,
        otp,
        type
    } = req?.body;
    if (!email || !otp || !type) {
        return next(new ApiError("Email , Otp, and type are required!", 400));
    }
    const otpDoc = await OTP.findOne({
        email,
        otp,
        type
    });
    if (!otpDoc) return next(new ApiError("OTP is expired", 400));

    if (type === "REGISTER") {
        const user = await User.findOneAndUpdate({
            email
        }, {
            isVerified: true
        }, {
            new: true
        });
        if (!user) return next(new ApiError("User not found", 400));
    } else if (type === "FORGOT_PASSWORD") {
        const user = await User.findOne({
            email
        });
        if (!user) return next(new ApiError("User not found", 400));
    } else {
        return next(new ApiError("Invalid OTP type", 400));
    }

    // OTP is verified — remove it
    await OTP.deleteOne({
        email,
        otp,
        type
    });

    res.status(200).json({
        success: true,
        message: type === "REGISTER" ?
            "OTP verified. User registered successfully." :
            "OTP verified. You can now reset your password.",
    });
});



export const login = asyncHandler(async (req, res, next) => {
    const {
        email,
        password
    } = req?.body;
    if (!email || !password) {
        return next(new ApiError("All fields are required", 400));
    }
    const existingUser = await User.findOne({
        email
    });
    if (!existingUser) return next(new ApiError("User not found", 400));

    // Check if the user is verified (if necessary)
    if (!existingUser.isVerified) {
        return next(
            new ApiError("Please verify your email before logging in.", 403)
        );
    }

    const isValidPassword = await existingUser.isPasswordCorrect(password);

    if (!isValidPassword) {
        return next(new ApiError("Wrong password", 400));
    }

    const access_token = existingUser.generateAccessToken();
    const refresh_token = existingUser.generateRefreshToken();
    existingUser.refreshToken = refresh_token
    await existingUser.save()
    // Convert Mongoose document to plain object
    const sanitizedUser = existingUser.toObject();
    sanitizedUser.password = undefined;
    sanitizedUser.createdAt = undefined;
    sanitizedUser.updatedAt = undefined;
    sanitizedUser.__v = undefined;

    res
        .cookie("access_token", access_token, {
            ...COOKIE_OPTIONS,
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        })
        .cookie("refresh_token", refresh_token, {
            ...COOKIE_OPTIONS,
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        })
        // .cookie("user_role", existingUser.role, {
        //     ...COOKIE_OPTIONS,
        //     expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        // })
        .status(200)
        .json({
            success: true,
            message: "Login Successful",
            user: sanitizedUser,
        });
});


export const forgotPassword = asyncHandler(async(req,res,next)=>{

    const { email } = req.body;

    const existingUser = await User.findOne({email})
    if(!existingUser){
        return next(new ApiError("The user does not exist",400))
    }
    const otp = generateOTP()
    const name  = existingUser?.name
    const data = await OTP.findOneAndUpdate({
                email: email
            }, {
        email:email,
        otp:otp,
        type:'FORGOT_PASSWORD'
    },{
        upsert:true, new:true
    })
    const sendResetMail = await sendPasswordResetOTPOnMail(email, {
        name,
        otp
    })
    if(!data){
       return next(new ApiError('Failed to send the mail',400)) 
    }
    res.status(200).json({message:"Otp for password sent successfully", success:true})    
})


export const resetPassword = asyncHandler(async(req,res,next)=>{
    const { otp, email, newPassword } = req.body
    /** find in OTP Model */
    const validOtp = await OTP.findOne({otp:otp, email:email})
    if(!validOtp){
        return next(new ApiError("Otp has expired"))
    }
    const existingUser= await User.findOne({email:email})
    existingUser.password= newPassword
    await existingUser.save()
    await OTP.deleteOne({_id:validOtp?._id});

    return res.status(201).json({message:"Password has been updated successfully",success:true})
})



/** google auth providers */
const google = new arctic.Google(clientId, clientSecret, redirectURI);


export const googleAuth= asyncHandler(async(req,res,next)=>{
const { role } = req.query
   const state = arctic.generateState();
   const codeVerifier = arctic.generateCodeVerifier();
   const scopes = ["openid", "profile","email"];
   const url = google.createAuthorizationURL(state, codeVerifier, scopes);

   res.cookie('google_oauth_state', state, {
    ...COOKIE_OPTIONS,
    maxAge: OAUTH_EXCHANGE_EXPIRY
   })
   res.cookie('google_code_verifier', codeVerifier, {
    ...COOKIE_OPTIONS,
    maxAge:OAUTH_EXCHANGE_EXPIRY
   })

   res.cookie('google_role',role,{
    ...COOKIE_OPTIONS,
    maxAge:OAUTH_EXCHANGE_EXPIRY
   })
//    console.log("url: ", url)
   res.redirect(url.toString())
})


export const googleAuthCallback = asyncHandler(async(req,res,next)=>{
     const { state, code} = req.query
     const { google_oauth_state, google_code_verifier , google_role} = req.cookies;

     console.log("the google role is", google_role)
     if (!code ||
        !state ||
        !google_oauth_state ||
        !google_code_verifier ||
        state !== google_oauth_state) {
        // 400
         return next(new ApiError('Inavalid requests',400))
    }
        let tokens
        let accessTokens 
    try {
        tokens = await google.validateAuthorizationCode(code, google_code_verifier)
        accessTokens = tokens.accessToken();

     } catch (error) {
        if (e instanceof arctic.OAuth2RequestError) {
             const code = e.code;
         }
        if (e instanceof arctic.ArcticFetchError) {
             const cause = e.cause;
         }
    }

    const idToken = tokens.idToken();
    const claims = arctic.decodeIdToken(idToken)
    console.log("the claims are", claims)
      const { sub: googleUserId, name, email, email_verified, picture } = claims;

     let user = await User.findOne({
         oauthAccounts: {
             $elemMatch: {
                 provider: "GOOGLE",
                 oauthSub: googleUserId
             },
         },
     });
       if (!user) {
           console.log("User not found with Google ID:");
           // User not found with Google ID
           //If no user with googleUserId, find user by email to link Google account
           user = await User.findOne({
               email: email
           });
           if (user) {
               // Check if Google account is already linked
               const hasGoogle = user?.oauthAccounts?.some(
                   (acc) => acc.provider === "GOOGLE" && acc.oauthSub === googleUserId
               );
               if (!hasGoogle) {
                   // Link Google OAuth account

                   user.oauthAccounts.push({
                       provider: "GOOGLE",
                       oauthSub: googleUserId
                   });
                   user.role = google_role
                   await user.save();
               }
           } else {
            user = new User({
                name: name || "Google User",
                email,
                role:google_role,
                oauthAccounts: [{
                    provider: "GOOGLE",
                    oauthSub: googleUserId
                }],
                isEmailVerified: email_verified,
                profilePicture: {
                    url: picture || DEFAULT_PICTURE_URL,
                    source: "GOOGLE",
                },
            });
            await user.save();
           }
       }
         const access_token = user.generateAccessToken();
         const refresh_token = user.generateRefreshToken();
res
    .cookie("access_token", access_token, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_EXPIRY, // 1 day
    })
    .cookie("refresh_token", refresh_token, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_EXPIRY, // 15 days
    });

res.clearCookie("google_oauth_state", {
    ...COOKIE_OPTIONS,
    maxAge: 0
});
res.clearCookie("google_code_verifier", {
    ...COOKIE_OPTIONS,
    maxAge: 0
});
  res.redirect(`${FRONTEND_URL}`);

})


