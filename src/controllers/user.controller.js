import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    //get input from frontend
    //validation-not empty
    //check if user already exists- username and email field
    //check avatar,coverimage
    //upload them to cloudinary,avatar
    //create user object-create entry in db
    //remove password and refresh tokens from res
    //check for user creation
    //return res
    const { username, fullName, email, password } = req.body



    if (fullName === "") {
        throw new ApiError(400, "enter a fullName")
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


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.
        coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].
            path

    }
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

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")

    )



})

const loginUser=asyncHandler(async(req,res)=>{
    //get data from user
    //validate-not empty
    //check if username/email exists
    //check password 
    //access and refresh token
    // cookie
    const {email,userName,password}=req.body

    if(!email && !userName){
        throw new ApiError(400,"email or useername is required")
    }

    const user=User.findOne({
        $or:[{email},{userName}]
    })

    if(!user){
        throw new ApiError(404,"enter correct email or username ")

    }

    const isPasswordValid=user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password not valid")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select(-password -refreshToken)
    
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },"user logged in successfully")
)

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken=undefined
            }
        },{
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfullly"))
    
})

export { 
    registerUser,
    loginUser,
    logoutUser
}