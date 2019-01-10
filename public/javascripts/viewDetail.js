
//ARMADA Tolong ini gak bisa jalan semua kalo di klik

$(document).ready(function(){
    $("#homeLink").click(function(){
        window.location.replace('/')
    })
    
    $("#myCourseLink").click(function(){
        window.location.href='/MyCourse'
    })

    $("#logoutLink").click(function(){
        localStorage.removeItem('session');
        localStorage.removeItem('email');
        window.location.replace('/');
    })
    
})
