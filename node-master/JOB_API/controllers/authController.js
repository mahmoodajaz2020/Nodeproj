const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// Register a new user => /register
exports.registerUser =catchAsyncErrors( async (req,res,next) => {

    const {name , email , password , role} = req.body ;

    const user = await User.create({
        name ,
        email ,
        password ,
        role
    });

    //Create JWT Token
    const token = user.getJwtToken();

    res.status(200).send({
        success : true ,
        message : 'User is Registered',
        data : User ,
        token 
    })

})


//Login user => /login

exports.loginUser =catchAsyncErrors( async (req,res,next) => {

    const { email , password } = req.body ;

    //Check email password is entered or not by user
    if(!email || !password)
    {
        return next(new ErrorHandler('Please enter the email & password') , 400);
    }

    //Finding the user in the databse

    const user = await User.findOne(   {   email   }   ).select('+password');

    if(!user){
        return next(new ErrorHandler('Envalid email or password') , 401);
    }

    //Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Envalid email or password') , 401);
    }

    // Create json web token
    sendToken(user , 200 , res );

} )


// Forgot Password => /password/forgot
exports.forgotPassword = catchAsyncErrors( async( req, res , next ) => {

    const user = await User.findOne({  email : req.body.email });

    // Check user email in data base
    if(!user){
        
        return next(new ErrorHandler('No user found with this email') , 404);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({  validateBeforeSave : false });

    //Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset link as follows:\n\n\n\n
                    ${resetUrl}\n\n\n\n
                    If you have not requested this then ignore this email`;

    
    try {
        
        await sendEmail({
            email : user.email ,
            subject : 'API Password Recovery Email',
            message
        })
    
        res.status(200).send({
            success : true ,
            message : `Email send successfully to : ${user.email}`
        })
    } catch (error) {
        
        user.resetPasswordToken = undefined ;
        user.resetPasswordExpire = undefined ;

        await user.save({ validateBeforeSavebeforeSave : false });

        return next(new ErrorHandler('Email Not Sent!') , 500);
    }



});


// Reset Password => /password/reset/:token
exports.resetPassword = catchAsyncErrors(  async (req,res,next) => {

    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256')
                                    .update(req.params.token)
                                    .digest('hex');
    
    const user = await User.findOne({ 
                    resetPasswordToken ,
                    resetPasswordExpire : {$gt : Date.now() } });

    if(!user){

        return next(new ErrorHandler('Password reset token is invalid or Expired',400));
    }

    //Setup new Password 
    user.password = req.body.password ;
    user.resetPasswordToken = undefined ;
    user.resetPasswordExpire = undefined ;
    
    await user.save();

    sendToken(user , 200 , res);


});


//Logout user => /logout

exports.logout = catchAsyncErrors(  async (req,res,next) => {

    res.cookie('token','none', {
        expires : new Date(Date.now()),
        httpOnly : true
    });

    res.status(200).send({
        success : true ,
        messsage : `Logged out successfully`
    })


});


