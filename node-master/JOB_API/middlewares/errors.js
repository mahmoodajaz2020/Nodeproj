const ErrorHandler = require('../utils/errorHandler');

module.exports = (err , req , res , next ) => {
    
    err.statusCode = err.statusCode || 500 ;
    

    if(process.env.NODE_ENV === 'development'){

        res.status(err.statusCode).send({
            success : false ,
            message : err ,
            errMessage : err.message ,
            stack : err.stack
        });
    }
    if(process.env.NODE_ENV === 'production'){

        let error = {...err} ;

        error.message = err.message ;

        // Wrong Mongoose Id Error
        if(err.name === 'CastError')
        {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message,404);

        }

        //Handling Mongoose validation error
        if(err.name === 'ValidationError')
        {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message,404);

        }

        //Handle moongose duplicate key error
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue) } entered`;
            error = new ErrorHandler(message,400);
        }

        //Handling Wrong JWT token eroor
        if(err.name === 'JsonWebTokenError')
        {
            const message = `Json Web Token invalid Try Again!`;
            error = new ErrorHandler(message,500);
        }

        //Handling Expired JWT Token Error
        if(err.name === 'TokenExpiredError')
        {
            const message = `Json Web Token is Expired Try Again!`;
            error = new ErrorHandler(message,400);
        }


        res.status(error.statusCode).send({
            success : false ,
            message : error.message || 'Internal Server Error',
        });
        
    }

};