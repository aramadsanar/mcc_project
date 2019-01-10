$(document).ready(function(){
    $("#myCourseLink").click(function(){
        window.location.replace('/MyCourse')
    })

    $("#logoutLink").click(function(){
        localStorage.removeItem('session');
        localStorage.removeItem('email');
        window.location.replace('/');
    })
})

$(document).ready(loadCourses);

function loadCourses(event) {

    $.ajax(
        {
            url: 'http://35.240.245.237:3000/courses',				
            success: loadCoursesDataToView
        }
    )
}


function loadCoursesDataToView(result) {
    let writableControl = $('#lv_course')
    //let parsedResult = JSON.parse(result);
    
    for (let course of result) {
        writableControl.append(makeCoursesControls(course));
    }

    writableControl.listview('refresh')
}

function makeCoursesControls(courseData) {
    let courseUrl = '/viewDetail?course='
    var htmlCode = 
    `<li>
        <a>
            <h2>${courseData['main_course_name']}</h2>
            <p><strong>${courseData['course_name']}</strong></p>
            <p>${courseData['description']}</p>
            <a href=${courseUrl + courseData['id']} data-role="button">Detail</a>
        </a>
        
	</li>`
    return htmlCode;
}


// //Harus ada data dari heroku, minta armada link nya
// function addList(data) {

//     for (let i = 0; i < data.length; i++) {
//         let temp = data[i];

//         let main_course = `<h2>${temp.main_course_name}</h2>`;
//         let name = `<h3>${temp.course_name}</h3>`;
//         let desc = `<h3>${temp.description}</h3>`;
//         let butt1 = `<a href="ViewDetail.html?course_id=${temp.id}" data-ajax="false" data-role="button">View Detail</a>`;


//         let item=`<li><div>${main_course}${name}${desc}${butt1}</div></li>`;

//         $('#lv_course').append(item);
        
//     }

//     $('#lv_course').trigger('create');
//     $('#lv_course').listview('refresh');
    
// }

// $(function(){
//     let URL = "https://22966819.ap.ngrok.io/courses";

//     let option ={
//         method:"GET",
//         url : URL,
//         //success: addList
//         success: (result) => {
//             for (x of result) {
//                 console.log(x['main_course_name'])
//             }
//         }
//     };

//     let request = $.ajax(option);

//     // request.done(function(r){
//     //     addList(r);
//     // });
// }); 