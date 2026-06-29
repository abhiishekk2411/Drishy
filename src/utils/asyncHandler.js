export {asyncHandler}
//below one is the try catch one and we can use any method based on production using it 
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        console.log("ERROR CAUGHT:", error)  
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}










//below one is the promise one
// const asyncHandler=(requestHandler)=>{
//     (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next))
//         .catch((error)=>next(error))
//     }
// }