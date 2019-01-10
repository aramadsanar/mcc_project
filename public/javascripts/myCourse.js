$(document).ready(function(){
    $("#homeLink").click(function(){
        window.location.replace('/Homepage')
    })

    $("#logoutLink").click(function(){
        localStorage.removeItem('session')
        localStorage.removeItem('email')
        window.location.replace('/')
    })
})