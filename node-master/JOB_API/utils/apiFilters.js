class APIFilters {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    filter(){

        const queryCopy = {...this.queryStr};

        //Removing feilds from query
        const removeFields = ['sort','fields','q','limit','page'];
        removeFields.forEach(el => delete queryCopy[el]);

        //Advance API filters
        let queryStr = JSON.stringify(queryCopy);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , 
                                match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryStr.sort)
        {
            this.query = this.query.sort(this.queryStr.sort)
        }
        else
        {
            this.query = this.query.sort('-postingDate');
        }
        return this.queryStr;
    }

    limitFields(){
        
       
        if(this.queryStr.fields){
            const feilds = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(feilds);
        }
        else
        {
            this.query = this.query.select('-__v');
        }
    }

    searchByQuery(){
        if(this.queryStr.q)
        {
            const qu = this.queryStr.q.split('-').join(' ');
            this.query = this.query.find(   {   $text : {   $search : "\""+ qu + "\""   }});
        }
        return this ;
    }

    pagination(){
        if(this.queryStr.limit)
        {

            const page = parseInt(this.queryStr.page , 10) || 1 ;
            const limit  = parseInt(this.queryStr.limit,10) || 10 ;
            const skipRsults = (page-1)*limit ;
            
            
            this.query = this.query.skip(skipRsults).limit(limit);
        }
            return this ;
    }
}

module.exports = APIFilters;