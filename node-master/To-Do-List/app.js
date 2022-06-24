const express  = require('express') ;
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs')
dotenv.config();

const PORT =  process.env.PORT ? process.env.PORT : 3000 ; 

// app.use(express.json());
app.use(cors());
// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// // Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.locals.layout = false; 
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT , ()=> {
    console.log(`Server is runnng at port ${PORT}`)
} )



app.get('/', (req, res) => {
    res.render('contact');
});


app.post('/add',async (req, res) => {

    try {
        
        let task = req.body , newFile = [] ;
        let file = fs.readFileSync('./public/db.json','utf-8') ;
        file = JSON.parse(file);
        let i=0 , taskDate = new Date(task.date);

        if(file.length==0)
        {
            newFile.push(task);
        }
        else
        {

            while(i<file.length)
            {
                let date = new Date( file[i].date ) ;
                // let time = file[i].time ;
                console.log(date )
                if( taskDate<=date)
                {
                    newFile.push(task);
                    break ;
                }
                else
                    newFile.push(file[i]);
                i++ ;
    
            }
            if(i==file.length)
            {
                newFile.push(task);
            }
            while(i<file.length)
            {
                newFile.push(file[i]);
                i++ ;
            }
            
            
        }
        
        fs.writeFileSync('./public/db.json' ,JSON.stringify(newFile) )

        res.send({
            success : true , 
            message : 'Task Added'
        })

    } catch (error) {
        console.log(error)
        res.send({
            success :false ,
            message : error
        })
    }

  });

  app.get("/todo/:day/:month/:year" , (req,res) => {

    let month = Number(req.params.month) ;
    let day = Number(req.params.day) ;
    let year = Number(req.params.year) ;

    console.log(day , month , year)
        let todoList = fs.readFileSync('./public/db.json','utf-8') ;
        todoList = JSON.parse(todoList);        

        let ToDo = [] ;

        if(isNaN(day))
        {

            for(let i=0;i<todoList.length ; i++)
            {
                const monthId = Number((new Date(todoList[i].date)).toISOString().split('T')[0].substring(5,7));
                // console.log(id)
                const yearId = Number((new Date(todoList[i].date)).toISOString().split('T')[0].substring(0,4));
                if(month === monthId && year === yearId)
                {
                    ToDo.push(todoList[i]);
                }
            }
        }
        else
        {
            // ToDo.push(todoList)
            for(let i=0;i<todoList.length ; i++)
            {
                const dayId = Number((new Date(todoList[i].date)).toISOString().split('T')[0].substring(8,10));
                // console.log(id)
                const yearId = Number((new Date(todoList[i].date)).toISOString().split('T')[0].substring(0,4));
                if(day === dayId && year === yearId)
                {
                    ToDo.push(todoList[i]);
                }
            }
            
        }
        res.send({
            success : true ,
            data : ToDo ,
            length : ToDo.length 
        })

  })


  app.delete('/delete/:id' , (req,res) => {
    
    const id = req.params.id ;

    let file = fs.readFileSync('./public/db.json','utf-8') ;
    file = JSON.parse(file);
    
    for(let i=0 ; i<file.length ;i++)
    {
        if(id == file[i].id)
        {
            file.splice(i,1);
        }
    }
    fs.writeFileSync('./public/db.json' ,JSON.stringify(file) )
    res.send({
        success : true ,
        message : 'Task Deleted Successfully!' 
    })
  })


