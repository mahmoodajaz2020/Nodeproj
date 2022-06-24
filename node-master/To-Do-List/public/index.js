// getting all required elements
// const inputBox = document.querySelector(".inputField input");
// const addBtn = document.querySelector(".inputField button");
// const todoList = document.querySelector(".todoList");
// const deleteAllBtn = document.querySelector(".footer button");

// // onkeyup event
// inputBox.onkeyup = ()=>{
//   let userEnteredValue = inputBox.value; //getting user entered value
//   if(userEnteredValue.trim() != 0){ //if the user value isn't only spaces
//     addBtn.classList.add("active"); //active the add button
//   }else{
//     addBtn.classList.remove("active"); //unactive the add button
//   }
// }

// today day and month
let month = Number((new Date(Date.now())).toISOString().split('T')[0].substring(5,7));
let day = Number((new Date(Date.now())).toISOString().split('T')[0].substring(8,10));
let year = Number((new Date(Date.now())).toISOString().split('T')[0].substring(0,4)) ;
let months = ['JAN' , 'FEB' , 'MAR' , 'APR' , 'MAY','JUN' 
              , 'JUL' , 'AUG' , 'SEP' ,'OCT','NOV' , 'DEC' ] ;
let Days = ['MON' , 'TUE' , 'WED' , 'THU' , 'FRI' , 'SAT' , 'SUN'];
 console.log(month , day , year)
const addToDo = () => {
  document.getElementById('monthlyToDoList').style.display = 'none' ;
  document.getElementById('dailyToDoList').style.display = 'none' ;
  document.getElementById('addToDoList').style.display = 'block' ;
  
  console.log('Add todo Task')
}
const monthlyToDo = () => {
  document.getElementById('monthlyToDoList').style.display = 'block' ;
  document.getElementById('dailyToDoList').style.display = 'none' ;
  document.getElementById('addToDoList').style.display = 'none' ;

  getTodoList("null" , month , year , "monthlyToDoList") ;
  
   
  // todo.innerHTML = "hi"

  console.log('Monthly Todo Task')
} 





const dailyToDo = () => {
  document.getElementById('dailyToDoList').style.display = 'block' ;
  document.getElementById('monthlyToDoList').style.display = 'none' ;
  document.getElementById('addToDoList').style.display = 'none' ;
 
  getTodoList(day , "null" , year , "dailyToDoList")

  console.log('Dauly Todo Task')
} 





const getTodoList = (day , month , year , element) => {
  let todoList ;

  let url = "http://localhost:3000/todo/" + day + "/" + month + "/" + year;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  // xhr.responseType = "json" ;
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          todoList = JSON.parse(xhr.response);
          console.log(todoList);
          let html = '' ;
          for(let i=0;i<todoList.length ; i++)
          {
            let id = (todoList.data[i].id) ;
            // token = `"` + token + `"`
            console.log(id)
            html += `<li>
                          ${todoList.data[i].message} 
                          <span class="icon" 
                              onclick="deleteTask('${id}')">
                              <i class="fas fa-trash"></i>
                          </span>
                    </li>`; 
          }
          
            html =` <p class="mt-4 font-weight-bold h5 ">Your Task for ${element == 'dailyToDoList' ? 'Day ' + day  : months[month-1] + ' Month'}!
                          
                            <span class="float-right ml-2" onclick="next('${element == 'dailyToDoList' ? 'day' : 'month'}')">
                              <i class="fas fa-angle-right" title="Next"></i>
                            </span>
                              <span class="float-right" onclick="prv('${element == 'dailyToDoList' ? 'day' : 'month'}')">
                              <i class="	fas fa-angle-left" title="Pevious"></i>
                            </span>
                          
                    </p>
                      <ul class="todoList" >
                        <!-- data are comes from local storage -->
                        ${html}
                      </ul>
                      
                  <div class="footer">
                    <span>You have <span class="pendingTasks">${todoList.length}</span> pending tasks</span>
                    
                  </div> `
          document.getElementById(element).innerHTML = html ;
          // console.log(xhr.responseText);
        }
        else
        {
          console.log("Error :: " , xhr.response) ;
        }
      }
    };
    
    xhr.send("")
}

const next = (cat) => {
  console.log(cat, ' here cat')
  if(cat=='month')
  {
    month++;
    if(month>12)
    month = 1 ;
    monthlyToDo() ;
  }
  else
  {
    day++ ;
    if(day>31)
    day=1 ;
    dailyToDo();
  }

}
const prv = (cat) => {
  if(cat=='month')
  {
    month-- ;
    if(month<1)
    month = 12 ;
    monthlyToDo() ;
  }
  else
  {
    day-- ;
    if(day<1)
    day=31 ;
    dailyToDo();
  }
}
const deleteTask = (id) => {
  console.log("todo" , id)
  let url = "http://localhost:3000/delete/" + id;

  let xhr = new XMLHttpRequest();
  xhr.open("DELETE", url);
  // xhr.responseType = "json" ;
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
        }
        else
        {
          console.log("Error :: " , xhr.response) ;
        }
    }
};

  xhr.send("")
}



const addTask = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    id : parseInt(Date.now() + Math.random()),
    date : new Date(formData.get('date') + 'T' + formData.get('time')) ,  
    message : formData.get('message')
  }
  // console.log('submit task ',data)
  // console.log(data.id)
  let url = "http://localhost:3000/add";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  // xhr.responseType = "json" ;
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(JSON.parse(xhr.response));
        }
        else
        {
          console.log("Error :: " , xhr.response) ;
        }
    }
};

  xhr.send(JSON.stringify(data))
  

}

const setMinDateTime = () => {
  const date = (new Date(Date.now())).toISOString().split('T')[0];
  const time =  (new Date(Date.now())).toISOString().split('T')[1].substring(0,5);
  console.log(time)
  document.getElementById("date").setAttribute("min" , date)
  document.getElementById("date").setAttribute("value" , date)
  document.getElementById("time").setAttribute("min" , time)
  document.getElementById("time").setAttribute("value" , time)
}
setMinDateTime() ;


// showTasks(); //calling showTask function

// addBtn.onclick = ()=>{ //when user click on plus icon button
//   let userEnteredValue = inputBox.value; //getting input field value
//   let getLocalStorageData = localStorage.getItem("New Todo"); //getting localstorage
//   if(getLocalStorageData == null){ //if localstorage has no data
//     listArray = []; //create a blank array
//   }else{
//     listArray = JSON.parse(getLocalStorageData);  //transforming json string into a js object
//   }
//   listArray.push(userEnteredValue); //pushing or adding new value in array
//   localStorage.setItem("New Todo", JSON.stringify(listArray)); //transforming js object into a json string
//   showTasks(); //calling showTask function
//   addBtn.classList.remove("active"); //unactive the add button once the task added
// }

// function showTasks(){
//   let getLocalStorageData = localStorage.getItem("New Todo");
//   if(getLocalStorageData == null){
//     listArray = [];
//   }else{
//     listArray = JSON.parse(getLocalStorageData); 
//   }
//   const pendingTasksNumb = document.querySelector(".pendingTasks");
//   pendingTasksNumb.textContent = listArray.length; //passing the array length in pendingtask
//   if(listArray.length > 0){ //if array length is greater than 0
//     deleteAllBtn.classList.add("active"); //active the delete button
//   }else{
//     deleteAllBtn.classList.remove("active"); //unactive the delete button
//   }
//   let newLiTag = "";
//   listArray.forEach((element, index) => {
//     newLiTag += `<li>${element}<span class="icon" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></span></li>`;
//   });
//   todoList.innerHTML = newLiTag; //adding new li tag inside ul tag
//   inputBox.value = ""; //once task added leave the input field blank
// }

// // delete task function
// function deleteTask(index){
//   let getLocalStorageData = localStorage.getItem("New Todo");
//   listArray = JSON.parse(getLocalStorageData);
//   listArray.splice(index, 1); //delete or remove the li
//   localStorage.setItem("New Todo", JSON.stringify(listArray));
//   showTasks(); //call the showTasks function
// }

// // delete all tasks function
// deleteAllBtn.onclick = ()=>{
//   listArray = []; //empty the array
//   localStorage.setItem("New Todo", JSON.stringify(listArray)); //set the item in localstorage
//   showTasks(); //call the showTasks function
// }