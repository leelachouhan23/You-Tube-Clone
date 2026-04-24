import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async(req,res) =>{
    

    const {fullName, email, username, password} = req.body
    // console.log("email:", email);

    if(
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }
        //for comparing or checikng
        const existedUser = await User.findOne({
            $or:[{ username },{ email}]
        })
        // console.log(existedUser);

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    // console.log(req.files)
    // console.log(req.body);
    const  avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //if their will be no coverImage then also if we want to got the output if you have coverImage then you continue with prier one
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
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
        "-password -refreshToken"
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