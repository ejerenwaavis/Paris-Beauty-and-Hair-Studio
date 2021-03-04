function showCardBody(evt){
  let cardBody = $(evt).find(".card-body")[0];
  $(cardBody).removeClass("d-none");
}


function hideCardBody(evt){
  let cardBody = $(evt).find(".card-body")[0];
  $(cardBody).addClass("d-none");
}


function editAccountInfo(){
  $("#accountUpdateForm").find(":input").removeAttr("disabled");
  $("#username").attr("disabled","");
  $("#updateProfileButton").removeClass("d-none").addClass("w-100");
  $("#updateProfileButton").fadeIn("slow");
}
