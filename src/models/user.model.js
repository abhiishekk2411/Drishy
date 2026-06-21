import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim=true,
            index: true                     //ye hai taki ye database ki searching me aane lag jaye
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim=true,
            unique: true
        },
        fullname: {
            type: String,
            required: true,
            trim=true,
            index: true
        },
        avatar: {
            type: String,                            //cloudinary url
            required: true
        },
        coverimage: {
            type: String

        },
        password: {
            type: String,
            required: [true, 'Password is required']

        },
        watchHistory: [
            {
                type: Schema.type.Objectid,
                ref: "Videos"
            }
        ],
        refreshToken: {
            type: String
        }
    }, {
    timestamps: true

}
)



export const User = mongoose.model("User", UserSchema)
