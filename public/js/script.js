function showCardBody(evt){
  let cardBody = $(evt).find(".card-body")[0];
  $(cardBody).removeClass("d-none");
}


function hideCardBody(evt){
  let cardBody = $(evt).find(".card-body")[0];
  $(cardBody).addClass("d-none");
}
