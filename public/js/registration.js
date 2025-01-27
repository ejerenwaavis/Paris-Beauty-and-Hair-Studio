username
$(function(){
  disableSubmit();
  setYear();
});


var domain = $("#domain").attr('domain');

function submitRegistrationForm(evt){
  // sf = $("#registrationForm").serializeArray();
  // form = {
  //   firstName: sf[0].value,
  //   lastName: sf[1].value,
  //   DoB: sf[2].value,
  //   username: sf[3].value,
  //   phone: sf[4].value,
  //   password: sf[5].value,
  //   confirmPassword: sf[6].value,
  // }
  // console.log(form);
}

function validateEmail(element){
  let username = element.value;
  if(username){
    $.post(domain+"/usernameExist", {username:username}, function(exists){
      if(exists){
        $("#username").addClass("border-danger");
        $("#usernameError").text("this email is already in Use");
        $("#usernameError").removeAttr("hidden");
        $("#usernameError").show();
        disableSubmit();
      }else{
        $("#username").removeClass("border-danger");
        $("#usernameError").hide();
        enableSubmit();
      }
    })
  }else{
    $("#username").addClass("border-danger");
    $("#usernameError").text("type a valid email address");
    $("#usernameError").show();
    disableSubmit();
  }
}

function validateFirstName(element){
  let firstName = element.value;
  if (firstName.length > 3){
    $("#firstNameError").hide();
    $("#firstName").removeClass("border-danger");
    $("#firstName").addClass("border-success");
    enableSubmit();
  }else{
    $("#firstNameError").removeAttr("hidden");
    $("#firstName").removeClass("border-success");
    $("#firstName").addClass("border-danger");
    disableSubmit();
  }
}
function validatePhone(element){}
function validatePassword(element){
  if($("#password").val().length>6){
    $("#password").removeClass("border-danger");
    $("#password").addClass("border-success");
    $("#passwordShort").hide();
  }else{
    // $("#passwordShort").text("Passwords must contain a minimum of 6 characters");
    $("#passwordShort").removeAttr("hidden");
    $("#passwordShort").show();
    $("#password").removeClass("border-success");
    $("#password").addClass("border-danger");
    console.log("password empty error");
  }


  if(element.value === $("#confirmPassword").val() ){
    $(element).removeClass("border-danger")
    $("#confirmPassword").removeClass("border-danger")
    $(element).addClass("border-success")
    $("#confirmPassword").addClass("border-success")
    $("#passwordError").hide()
    enableSubmit();
  }else{
    $(element).removeClass("border-success")
    $("#confirmPassword").removeClass("border-success")
    $(element).addClass("border-danger")
    $("#confirmPassword").addClass("border-danger")
    $("#passwordError").removeAttr("hidden");
    $("#passwordError").show();
    disableSubmit();
  }
}
function validateConfirmPassword(element){
  // console.log(element.value);
  if(element.value === $("#password").val() ){
    $(element).removeClass("border-danger")
    $("#password").removeClass("border-danger")
    $("#passwordError").hide()
    enableSubmit();
  }else{
    $(element).addClass("border-danger")
    $("#password").addClass("border-danger")
    $("#passwordError").removeAttr("hidden");
    $("#passwordError").show();
    disableSubmit();
  }
}


function enableSubmit(){
  // /check all form fields  before enabling
  validateAllFields();
  //
  // $("#registerButton").removeAttr("disabled");
  // $("#registerButton").removeClass("disabled");

}

function disableSubmit(){
  $("#registerButton").attr("disabled","");
  $("#registerButton").addClass("disabled");
}

function setYear(){
  let date = new Date();
  stringDate = ''+(date.getFullYear()-3)+"-"+ date.getMonth() +"-"+date.getDate();
  console.log(stringDate);
  $("#DoB").attr("max",(date.getFullYear()-3)+"-01-01");
  $("#DoB").attr("min",(date.getFullYear()-100)+"-01-01");
}


function validateAllFields(){
  form = $("#registrationForm").serializeArray();
    let errCount = 0;

    if($("#firstName").val().length>3){
      $("#firstName").removeClass("border-danger");
      $("#firstName").addClass("border-success");
    }else{
      $("#firstName").addClass("border-danger");
      $("#firstName").removeClass("border-success");
      console.log("firtst Name error");
      errCount++;
    }

    if($("#lastName").val().length>3){
      $("#lastName").removeClass("border-danger");
      $("#lastName").addClass("border-success");
    }else{
      $("#lastName").addClass("border-danger");
      $("#lastName").removeClass("border-success");
      console.log("Last name Error");

      errCount++;
    }

    if($("#DoB").val()){
      $("#DoB").removeClass("border-danger");
      $("#DoB").addClass("border-success");
    }else{
      $("#DoB").addClass("border-danger");
      $("#DoB").removeClass("border-success");
      console.log("DoB error");
      errCount++;
    }

    if($("#username").val().length>3){
      $("#username").removeClass("border-danger");
      $("#username").addClass("border-success");
    }else{
      $("#username").addClass("border-danger");
      $("#username").removeClass("border-success");
      console.log("username cannot be empty");
      errCount++;
    }

    if($("#phone").val().length>3){
      $("#phone").removeClass("border-danger");
      $("#phone").addClass("border-success");
    }else{
      $("#phone").addClass("border-danger");
      $("#phone").removeClass("border-success");
      console.log("no phone number");
      errCount++;
    }

    if($("#password").val().length>6){
      $("#password").removeClass("border-danger");
      $("#password").addClass("border-success");
      $("#passwordShort").hide();
    }else{
      // $("#passwordShort").text("Passwords must contain a minimum of 6 characters");
      $("#passwordShort").removeAttr("hidden");
      $("#passwordShort").show();
      $("#password").removeClass("border-success");
      $("#password").addClass("border-danger");
      console.log("password empty error");
      errCount++;
    }

    if($("#confirmPassword").val() === $("#password").val()){
      $("#confirmPassword").removeClass("border-danger");
      $("#confirmPassword").addClass("border-success");
      $("#passwordError").hide();
    }else{
      // $("#passwordError").text("Passwords must contain a minimum of 6 characters");
      $("#passwordError").removeAttr("hidden");
      $("#confirmPassword").removeClass("border-success");
      $("#confirmPassword").addClass("border-danger");
      console.log("Password match error");
      errCount++;
    }


    if(errCount == 0){
      $("#registerButton").removeAttr("disabled");
      $("#registerButton").removeClass("disabled");
    }else{
      disableSubmit();
    }
}
