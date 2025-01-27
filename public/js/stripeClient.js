// A reference to Stripe.js initialized with your real test publishable API key.
var stripe = Stripe("pk_test_51IKaVOFaAPs4sOpE6Tzr7rBqcXwGEu07yfRghRSh7dsznqZItuCuUO8EKdgejneP9BpKgZjSvJvFXJlRjn7xNhyi003SY2PmFZ");

//Diable Pay Button onload is in ModalControl.js and is called at load of Booking Pane4
//Creation of paymentIntent also is called at the load of booking pane 4


// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function(stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(function(result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
function orderComplete (paymentIntentId) {
/*  document
    .querySelector(".result-message a")
    .setAttribute(
      "href",
      "https://dashboard.stripe.com/test/payments/" + paymentIntentId
    );*/
  document.querySelector(".result-message").classList.remove("hidden");
  $("#payButton").attr("disabled","");
  setTimeout(finalizeOrder(),4000)
};

// Show the customer the error from Stripe if their card fails to charge
function showError(errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
function loading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#payButton").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#payButton").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};


function createPaymentIntent(purchase){
  $.post(domain+"/create-payment-intent", {body: purchase })
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
      card.mount("#card-element");
      card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("#payButton").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
        // $("#payButton").attr("disabled","");
      });
      var form = document.getElementById("payment-form");
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        payWithCard(stripe, card, data.clientSecret);
      });
    })
}

function finalizeOrder(){
  // console.log("redirecting to home page");
  // console.log(apptID);

  $.post("confirmAppointment", {id:apptID}, function (result) {
       // Do something with the result
       console.log(result);
       if(result == "success"){
         $("#processInfo2").fadeOut("fast");
         blockBookingPannel();
         setTimeout(function(){
           $("#processInfo").html("<div class='my-5 py-5'><span class='text-success'><strong>Thank you!</strong> <br>We sent you an email with details of your appointment. <br> You may now close this dialog.</span></div>");
           $("#loadingSign").hide();
           $("#processInfo").fadeIn("slow");
         },4000);

         loading(false);

       }
   });

}
