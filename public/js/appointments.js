let confirmApptID;

function openPayementPanel(evt){
  $("#successConfirmed").hide();
  blockConfirmPanel();
  $("#confirm-payButton").attr("disabled");
  let element = $(evt);
  let appt = JSON.parse(element.attr("apptString"));
  apptID = appt._id;

  $("#confirmCheckOutBase").text(appt.style.baseStyle);
  $("#confirmCheckOutOption").text(appt.style.option);

  let pricings;
  $.post("/orderPricings",appt, function(res){
    // console.log(res);
    pricings = res;
    if(pricings){
      $("#confirmCheckOutDeposit").html((pricings.deposit/100).toFixed(2));
      $("#confirmCheckOutTax").html((pricings.tax/100).toFixed(2));
      $("#confirmCheckOutTotal").html((pricings.total/100).toFixed(2));
      showConfirmPanel();
      createConfirmPaymentIntent(pricings);
    }
  });
}

function blockConfirmPanel(){
  $("#confirmPayment").hide();
  $("#confirmLoadingSign").fadeIn();
}

function showConfirmPanel(){
  $("#confirmLoadingSign").hide();
  $("#confirmPayment").fadeIn();
}

function createConfirmPaymentIntent(purchase){
  $.post("/create-payment-intent", {body: purchase })
    .then(function(result) {
      return result;
    })
    .then(function(data) {
      var elements = stripe.elements();
      var style = {
        base: {
          color: "#cb2975",
          fontFamily: 'inherit',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#cb2975"
          }
        },
        invalid: {
          fontFamily: 'inherit',
          color: "#cb2975",
          iconColor: "#cb2975"
        }
      };
      var card = elements.create("card", { style: style });
      // Stripe injects an iframe into the DOM
      card.mount("#confirm-card-element");
      card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("#confirm-payButton").disabled = event.empty;
        document.querySelector("#confirm-card-error").textContent = event.error ? event.error.message : "";
        // $("#payButton").attr("disabled","");
      });
      var form = document.getElementById("confirm-payment-form");
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        confirmPayWithCard(stripe, card, data.clientSecret);
      });
    })
}

//Diable Pay Button onload is in ModalControl.js and is called at load of Booking Pane4
//Creation of paymentIntent also is called at the load of booking pane 4


// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var confirmPayWithCard = function(stripe, card, clientSecret) {
  confirmLoading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(function(result) {
      if (result.error) {
        // Show error to your customer
        confirmShowError(result.error.message);
      } else {
        // The payment succeeded!
        confirmOrderComplete(result.paymentIntent.id);
      }
    });
};

function confirmOrderComplete (paymentIntentId) {
  document.querySelector(".result-message").classList.remove("hidden");
  $("#confirm-payButton").attr("disabled","");
  setTimeout(confirmFinalizeOrder(apptID),4000)
};

function confirmShowError(errorMsgText) {
  confirmLoading(false);
  var errorMsg = document.querySelector("#confirm-card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
function confirmLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#confirm-payButton").disabled = true;
    document.querySelector("#confirm-spinner").classList.remove("hidden");
    document.querySelector("#confirm-button-text").classList.add("hidden");
  } else {
    document.querySelector("#confirm-payButton").disabled = false;
    document.querySelector("#confirm-spinner").classList.add("hidden");
    document.querySelector("#confirm-button-text").classList.remove("hidden");
  }
};


function confirmFinalizeOrder(apptID){
  // console.log("redirecting to home page");
  // console.log(apptID);

  $.post("confirmAppointment", {id:apptID}, function (result) {
       // Do something with the result
       console.log(result);
       if(result == "success"){
         blockConfirmPanel();
         setTimeout(function(){
           $("#confirmLoadingSign").hide();
           $("#successConfirmed").fadeIn("slow");
         },2000);

         confirmLoading(false);

       }
   });

}





function openDeleteDialog(evt){
  let apptID = $(evt).attr("apptID");
  console.log(apptID);
  $("#confirmDeleteButton").attr("apptID",apptID);
}

function deleteAppt(evt){
  $("#confirmDeleteButton").html('<i class=" px-3 fas fa-circle-notch fa-spin"></i>');
  $("#confirmDeleteButton").attr("disabled","");
  apptID = $(evt).attr("apptID");
  $.ajax({
    url: '/appt',
    type: 'DELETE',
    data: {apptID:apptID},
    success: function(result) {
        console.log(result);
        if(result){
          location.reload();
        }else{
          $("#confirmDeleteButton").html("Delete");
          $("#confirmDeleteButton").removeAttr("disabled");
        }
    },
    error: function(result){
      console.log(result);
    },
  });

}
