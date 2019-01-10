$(document).ready(
    function() {
        $("#form_login").submit(function(){
            window.location.replace('/Homepage')
        })
        
    }
)

$(document).ready(
    function(){
        $("#facebookBtn").click(function(){
            window.location.replace('/regis')
        })
        
        $("#registrationForm").click(function(){
            window.location.replace('/regis')
        })
   }
)

