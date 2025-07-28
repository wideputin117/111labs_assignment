import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv';
import { errorHandler } from './src/middlewares/errorHandler.js';


/**the routers from the routes */
import authRouter from './src/routes/auth.routes.js'
import adminRouter from './src/routes/admin.routes.js'
import { connectToMongoDB } from './src/configs/db.js';
/**----------------------------------------------------------------------------------------------------------------------------------------------*/
configDotenv()

const app = express()
app.use(
    cors({
        origin: process.env.NODE_ENV === "development" ?
            [
                "http://localhost:4000",
                "http://localhost:4002",
                "http://localhost:4003",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "https://i11-frontend.vercel.app",
                "https://i11-frontend-frpi.vercel.app"                

            ] :
            [
                "http://localhost:3000",
                "http://localhost:3001",
                "https://i11-frontend.vercel.app",
                "https://i11-frontend-frpi.vercel.app"
                
            ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
        credentials: true,
    })
);

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan('dev'))
app.set("view engine", "ejs");


app.use(`/health`,async(req,res)=>{
    res.status(200).json({message:'Server is running well', success:true})
})

/** our routes */
app.use(`/api/v1/auth`, authRouter)
app.use(`/api/v1/admin`,adminRouter) 
app.use(errorHandler)

app.listen(process.env.PORT,async()=>{
    await connectToMongoDB()
    console.log("the port is running on", process.env.PORT)
})



