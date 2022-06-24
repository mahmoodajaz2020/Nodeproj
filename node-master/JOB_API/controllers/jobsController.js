 
const Job = require('../models/jobs');
const geoCoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const APIFilters = require('../utils/apiFilters');
const path = require('path');
const { join } = require('path');


//Get all jobs  => /jobs

exports.getJobs =catchAsyncErrors( async (req,res,next) =>{
     
    const   apiFilters = new APIFilters(Job.find(),req.query)
            apiFilters.filter();
            apiFilters.sort();
            apiFilters.limitFields();
            apiFilters.searchByQuery();
            apiFilters.pagination();

    const jobs = await apiFilters.query;

    res.status(200).send({
        success : true ,
        result : jobs.length ,
        data : jobs
    })
})

//Get a single job with id and slug => job/:id/:slug 
exports.getJob  =catchAsyncErrors(  async (req,res,next) => {
    
    let job =await Job.find({$and: [{_id : req.params.id}, {slug : req.params.slug}]});

    if(!job || job.length===0)
    {
        return next(new ErrorHandler('Job not found',404));
    }
    res.status(200).send({
        success : true ,
        message : 'Job found!' ,
        data : job
    })
})
//add new jobs  => /job/new

exports.newJob =catchAsyncErrors( async (req,res,next) => {

    //Adding to user top body
    req.body.user = req.user.id ;
    const job =await  Job.create(req.body);
    
    res.status(200).send({
        success : true ,
        message : 'Job Created',
        data : job
    })
})


// Update the Job => /job/:id
exports.updateJob  =catchAsyncErrors(  async (req,res,next) => {
    
    let job =await Job.findById(req.params.id);

    if(!job)
    {
        return next(new ErrorHandler('Job not found',404));
        
    }

    job = await Job.findByIdAndUpdate(req.params.id , req.body , {
        new : true ,
        runValidators : true ,
        useFindAndModify : true 
    })
    res.status(200).send({
        success : true ,
        message : 'Job is Updated' ,
        data : job
    })
})


// Delete a job => /job/:index
exports.deleteJob =catchAsyncErrors(   async (req , res , next ) => {

    let job =await Job.findById(req.params.id);

    if(!job)
    {
        return next(new ErrorHandler('Job not found',404));
    }

    job = await Job.findByIdAndDelete(req.params.id)
    res.status(200).send({
        success : true ,
        message : 'Job is Deleted' ,
        data : job
    })
})

// Search jobs within radius => /jobs/:zipcode/:distance

exports.getJobsInRadius =catchAsyncErrors(  async (req,res,next) => {
    
    const {zipcode , distance} = req.params ;
    
    //  Getting ltitude and longitude from geocoder with zipcode

    const loc = await geoCoder.geocode(zipcode);
    const longitude = loc[0].longitude;
    const latitude = loc[0].latitude;
    const radius = distance / 3963 ;
    const jobs = await Job.find({
        location : {$geoWithin : {$centerSphere : [[longitude , latitude] , radius ]}
        }
    });

    res.status(200).send({
        success : true ,
        results : jobs.length ,
        data : jobs
    })


})

//Get stats about a topic(job) => stats/:topic

exports.jobStats =catchAsyncErrors(  async (req,res,next) => {

    const stats = await Job.aggregate([
        {
            $match : { $text : {$search : "\""+req.params.topic + "\""} }
        },
        {
            $group : {
                _id : {$toUpper : '$experience'} ,
                totalJobs : {$sum : 1},
                avgPosition : {$avg : '$positions'},
                avgSalary :     {   $avg : '$salary'    },
                minSalary : {$min : '$salary'},
                maxSalary : {$max : '$salary'}
            }
        }
    ]);
    if(stats.length === 0)
    {
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`,200));
       

    }

    res.status(200).send({
        success : true ,
        data : stats
        
    })
})




//Apply Job using resume => /job/:id/apply
exports.applyJob = catchAsyncErrors( async(req,res,next) => {

    const job = await Job.findById(req.params.id).select('+applicantsApplied');

    if(!job)
    {
        return next(new ErrorHandler(`Job not found for`, 404));
    }

    //Check that if job last day has passed
    if(job.lastDate < new Date(Date.now()))
    {
        return next(new ErrorHandler(`You can not applyfor this job , Date is over`, 404));
    }


    //CHECK IF THE USER HAS ALREADY APPLIED OR NOT
    for(let i=0;i<job.applicantsApplied.length ; i++)
    {
        if(job.applicantsApplied[i].id === req.user.id){

            return next(new ErrorHandler(`You have already applie for thios job`, 400));
        }
    }
    

    //Check the files
    if(!req.files)
    {
        return next(new ErrorHandler(`Please Upload File!`, 404));
    }

    const file = req.files.file ;

    //Check file type
    const supportedFiles = '/.docs|.pdf/';

    if(!supportedFiles.test(path.extname(file.name)))
    {
        return next(new ErrorHandler(`Please upload .doc or .pdf file!`, 400));
    }

    //Check document size limit
    if(file.size > process.env.MAX_FILE_SIZE)
    {
        return next(new ErrorHandler(`Please upload file less the 50MB`, 400));
    }

    //Renaming the document
    file.name = `${req.user.name.replace(' ','_')}_${job._id}${path.parse(file.name).ext}`;


    file.mv(`${process.env.UPLOAD_PATH}/${file.name}` , async err => {
        if(err){
            console.log(err);
            return next(new ErrorHandler(`ResumeUpload Failed`, 500));
        }   
        await Job.findByIdAndUpdate(req.params.id , {$push : {
            applicantApplied : {
                id : req.user.id ,
                resume : file.name
            }},
            new : true ,
            runValidators : true ,
            useFindAndModify : false
        }) ;
        res.status(200).send({
            success : true ,
            message : 'Applied to job successfully',
            data : file.name

        })

    })




    
} );

