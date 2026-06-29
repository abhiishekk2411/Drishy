import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router=Router()
router.route("/register").post(
    //middlewares
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"CoverImage",
            maxCount:1

        }
    ]),
    //main function called
    registerUser
    
)

export default router