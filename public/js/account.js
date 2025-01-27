
$(function(){
  // setYear();
});

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

// function setYear(){
//   let date = new Date();
//   stringDate = ''+(date.getFullYear()-3)+"-"+ date.getMonth() +"-"+date.getDate();
//   console.log(stringDate);
//   $("#DoB").attr("max",(date.getFullYear()-3)+"-01-01");
//   $("#DoB").attr("min",(date.getFullYear()-100)+"-01-01");
// }


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

    if($("#phone").val().length>3){
      $("#phone").removeClass("border-danger");
      $("#phone").addClass("border-success");
    }else{
      $("#phone").addClass("border-danger");
      $("#phone").removeClass("border-success");
      console.log("no phone number");
      errCount++;
    }





    if(errCount == 0){
      $("#updateAccountButton").removeAttr("disabled");
      $("#updateAccountButton").removeClass("disabled");
    }else{
      disableSubmit();
    }
}

function editAccountInfo(){
  $("#accountUpdateForm").find(":input").removeAttr("disabled");
  $("#accountUsername").attr("disabled","");
  $("#updateAccountButton").removeClass("d-none").addClass("w-100");
  $("#updateAccountButton").fadeIn("slow");
}
