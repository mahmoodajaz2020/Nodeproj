const express = require('express');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const fileUpload = require('express-fileupload');


//helmet is a package to enable security headers in the api_call
const helmet = require('helmet');


dotenv.config({path: './config/config.env'});

// Handling uncaught Exception
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception`);
    
        process.exit(1);
    
})

app.use(express.json());
app.use(cors());





//connecting to database
connectDatabase();

const PORT = process.env.PORT ;
const server = app.listen(PORT,()=>{
    console.log(`Server is running at port : ${PORT}`);
})

//Set cookie parse
app.use(cookieParser());

//Handle file uplaod
app.use(fileUpload());

//Setup security Headers
app.use(helmet());


//Rate Limiting  // Limiting the number of call by a user // security feature // 100requests/10 mins
const limiter = rateLimit({
    windowMs : 10*60*1000 ,   //10Mins
    max : 100
})
app.use(limiter);

//Setup cors - Accessiable by other domain
app.use(cors());

const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user');
app.use('/',jobs); 
app.use('/',auth); 
app.use('/',user); 

// Handle unhandled routes
app.all('*' , (req,res,next) => {

        next(new ErrorHandler(`${req.originalUrl} Route not found`,404));
})

//Middle ware to handle error
app.use(errorMiddleware);


// Handling unhandled promise rejection

process.on('unhandledRejection', err => {

    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandles promise rejection`);
    server.close(()=> {
        process.exit(1);
    })
});


