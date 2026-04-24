import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary"
import {ApiResponse} from "..utils/ApiResponse.js"
const registerUser = asyncHandler(async(req,res) =>{
    
    const {fullName, email, username, password} = req.body
    console.log("email:", email);

    if(
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }
        //for comparing or checikng
        const existedUser = User.findOne({
            $or:[{ username },{ email}]
        })
        console.log(existedUser);

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const  avatarLocarPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocarPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocarPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     
    if(!avatar){
        throw new ApiError(400, "Avatar file should must be their");
    }

    const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

     const createdUser = await User.findById(user._id).select(
        "-password - refreshToken"
     )

     if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
     }

     return res.status(201).json(
        new ApiResponse(200, createdUser,
             "User registered successfully")
     )

})

export { registerUser }


//algorithms is this...
//get user details from frontend
//validation-not empty
//cehck it user already exists: username, email
//check for images, check for avatar
// upload then to cloudinaty, avatar
//created user object-create entry in db
// remove password and refresh token field from response
//check fro user creation 
// return res.