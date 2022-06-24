const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder')
const jobSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : [true , 'Please enter the job title'] ,
        trim : true , 
        maxlength : [100 , 'job title can not exceed 100 characters']
    },
    slug : String ,
    description :{
        type : String ,
        required : [true , 'Plese enter job description'] ,
        maxlength : [1000 , 'job description can not exceed 1000 characters']
    },
    email : {
        type : String , 
        validate : [validator.isEmail , 'Please add the valid email address'] 
    },
    address : {
        type : String ,
        required : [true , 'Please add an address']
    },
    location : {
        type : {
            type : String ,
            enum : ['Point']
        },
        coordinates : {
            type : [Number],
            index : '2dsphere'
        },
        formattedAddress : String,
        city : String,
        state : String ,
        zipcode : String ,
        country : String 
    },
    company : {
        type : String ,
        required : [true , 'Please add the company name']
    },
    industry : {
        type : [String] ,
        required : [true , 'please enter indusry for this job' ] , 
        enum : {
            values : [
                'Business' ,
                'Information Technology' ,
                'Banking' ,
                'Education/Training' ,
                'Telecommunication' , 
                'Others'
            ] ,
            message : 'Plese enter the correct options'
        }
    },
    jobType : {
        type : String ,
        required : [true , 'please enter job Type'] ,
        enum :{
            values : [
                'Permanent' ,
                "Temporary" ,
                'Contract' ,
                'Internship',
            ] ,
            message : 'Plese select correct option for job type'
        }
    },
    minEducation :{
        type : String ,
        required : [true , 'please enter minimum education'] ,
        enum :{
            values : [
                'Bachelors' ,
                'Masters' ,
                'Phd' 

            ] ,
            message : 'Please enter the correct option for minumin education'
        }
    },
    positions :{
        type : Number ,
        default : 1
    },
    experience : {
        type : String ,
        required : [true , 'please enter experience required for the job'] , 
        enum : {
            values : [
                "No Experience" ,
                "1 Year - 2 Years" ,
                "2 Year - 5 Years" ,
                "3 Years+"
            ] ,
            message : 'Please select the correct option for experience'
        }
    },
    salary : {
        type : Number , 
        required : [true , 'Please enter the expected salary']
    },
    postingData : {
        type : Date , 
         default : Date.now
    },
    lastDate : {
        type : Date ,
        default : new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied : {
        type : [Object] ,
        select : false
    },
    user : {
        type : mongoose.Schema.ObjectId ,
        ref : 'User',
        required : true
    }
})

//Crerating job slug before saving

jobSchema.pre('save', function(next){
    //Creating slug before saving to DB
    this.slug = slugify(this.title , {lower : true});

    next();
});


//setting up location

jobSchema.pre('save',async function(next){

        const loc =await geoCoder.geocode(this.address);
        
        this.location ={
            type : 'Point' ,
            coordinates : [loc[0].longitude,loc[0].latitude],
            formattedAddress : loc[0].formattedAddress,
            city : loc[0].city,
            state : loc[0].stateCode,
            zipcode : loc[0].zipcode,
            country : loc[0].countryCode
        }
})

module.exports = mongoose.model('Job',jobSchema);