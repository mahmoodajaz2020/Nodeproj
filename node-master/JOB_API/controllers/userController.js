const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');
const APIFilters = require('../utils/apiFilters');

//Get current user profile => /me
exports.getUserProfile = catchAsyncErrors( async(req,res,next) => {

    const user = await User.findById(req.user.id)
                        .populate({
                            path : 'jobsPublished' ,
                            select : 'title postingDate'
                        })

    res.status(200).send({
        success : true ,
        data : user
    })

} )

//Update current user password => /password/update
exports.updatePassword = catchAsyncErrors( async(req,res,next) => {

    const user = await User.findById(req.user.id).select('+password');

    //Check previous user password
    const isMatched = await user.comparePassword(req.body.currentPassword);
    if(!isMatched){
        return next(new ErrorHandler('old Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user , 200 , res);


    

} )


//Update current user profile => /me/update
exports.updateUser = catchAsyncErrors( async(req,res,next) => {

    const newUserrData = {
        name : req.body.name ,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id , newUserrData , {
        new : true ,
        runvalidators : true ,
        useFindAndModify : false
    })

    res.status(200).send({
        success : true ,
        data : user
    })

    
} )



//Show all applied jobs => /jobs/applied
exports.getAppliedJobs = catchAsyncErrors( async(req,res,next) => {

    const jobs = await Job.find({'applicantsApplied.id': req.user.id})
                .select('+applicantsApplied');

    res.status(200).send(
        {
            success : true ,
            results : jobs.length ,
            data : jobs
        }
    )
} )

//Show all jobs published by employeer
exports.getPublishedJobs = catchAsyncErrors( async(req,res,next) => {

    const jobs = await Job.find({user: req.user.id});

    res.status(200).send(
        {
            success : true ,
            results : jobs.length ,
            data : jobs
        }
    )
} )






//Delete current user profile => /me/delete
exports.deleteUser = catchAsyncErrors( async(req,res,next) => {

    deleteUserData(req.user.id , req.user.role);
    const user = await User.findByIdAndDelete(req.user.id)

    res.cookie('token' , 'none',{
        expires : new Date(Date.now()),
        httpOnly : true
    });
    res.status(200).send({
        success : true ,
        data : 'Your account has been deleted'
    })

    
} )


//Adding controller methods that only accassable by admin


//show all user => /users
exports.getUser = catchAsyncErrors( async(req,res,next) => {

    const apiFilters = new APIFilters(user.find() , req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination()

    const users = await apiFilters.query ;
    res.status(200).send({
        success : true ,
        result : users.length ,
        data : users
    })

    
} )



// Delete user method only accessable by admin  => /user/:id
exports.deleteUserAdmin = catchAsyncErrors( async(req,res,next) => {

    const user = await User.findById(req.params.id);


    if(!user)
    {
        return next(new ErrorHandler(`user not found with id : ${req.params.id}`, 404));
    }

    deleteUserData(user.id , user.role);

    await user.remove();

    res.status(200).send({
        success : true ,
        message : 'user is deleted by admin'
    })

    
} )




async function deleteUserData(user , role){



    if(role === 'employeer')
    {
        await Job.deleteMany({ user : user });
    }
    if(role === 'user')
    {
        const appliedJobs = await Job.find({'applicantsApplied.id': user})
                                        .select('+applicantsApplied');

        for(let i=0;i<appliedJobs.length;i++)
        {
            let obj = appliedJobs[i].applicantsApplied.find( o => o.id === user );

            console.log(_dirname);

            let filepath = `${_dirname}/public/uploads/${obj.resume}`.replace('||controllers','');

            fs.unlink( filepath , err => {
                if(err){
                    return console.log(err);
                }
            });

            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].
                        applicantsApplied.indexOf(obj.id));

            
                        await appliedJobs[i].save();

        }
    }

}


