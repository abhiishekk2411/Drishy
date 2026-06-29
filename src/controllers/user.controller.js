import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
    //get input from frontend
    //validation-not empty
    //check if user already exists- username and email field
    //check avatar,coverimage
    //upload them to cloudinary,avatar
    //create user object-create entry in db
    //remove password and refresh tokens from res
    //check for user creation
    //return res
    const { username, fullname, email, password } = req.body
    console.log("email: ", email)


    if (fullname === "") {
        throw new ApiError(400, "enter a fullname")
    }
    if (email === "") {
        throw new ApiError(400, "enter a email")
    }
    if (username === "") {
        throw new ApiError(400, "enter a username")
    }
    if (password === "") {
        throw new ApiError(400, "enter a password")
    }


    const existedUser = User.find({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "no avatar uploaded")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new ApiError(400, "avatar is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"                                                          //isme wo likhenge jo nahi chahiye,by default all selected hote hai
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")

    )



})

export { registerUser }