let bookingStage = 1;
let styles = [];


function closeReviewModal(evt) {
  $("#review").modal('hide');
  $('#booking-form-modal').modal('show');
  // $('#booking-form-modal').handleUpdate();
}


function showNextTab() {
  if (bookingStage < 3) {
    var triggerEl = $('a[href="#stage' + (bookingStage + 1) + '-pane"]')
    triggerEl.tab('show'); // Select tab by name

    $("#stage" + bookingStage + "-dummy-link").addClass("disabled");
    $("#stage" + (bookingStage + 1) + "-dummy-link").removeClass("disabled")
    disableNextButtons();
    enablePrevioustButton();
    console.log("next Stage is " + (bookingStage + 1));
    bookingStage++;
    setProgress();
  } else {
    console.log("Checkout needed");
  }
}

function showPreviousTab() {
  if (bookingStage > 1) {
    var triggerEl = $('a[href="#stage' + (bookingStage - 1) + '-pane"]')
    triggerEl.tab('show'); // Select tab by name

    $("#stage" + bookingStage + "-dummy-link").addClass("disabled");
    $("#stage" + (bookingStage - 1) + "-dummy-link").removeClass("disabled")
    console.log("next Stage is " + (bookingStage - 1));
    bookingStage--;
    enableNextButtons();
    if (bookingStage == 1) {
      disablePrevioustButton()
    }
    setProgress();
  } else {
    console.log("cant goo backwards anymore");
  }
}


function loadStyles() {
  blockBookingPannel();
  hideStylistSection();
  let htmlSelectOptions = '<option value="null" selected>Select Base Style</option>';

  $.get("/getStyles", function(data) {
    if (data) {
      for (style of data) {
        htmlSelectOptions += '<option value="' + style.baseStyle + '">' + style.baseStyle + '</option>'
      }
      $("#styleSelect").html(htmlSelectOptions);
      $('#styleSelect').change(showStyleOPtions);
      showBookingPannel();
      $("#nextTabButton").addClass("disabled");
      $("#previousTabButton").addClass("disabled");
      styles = data;
    } else {
      //keep spining the circle and display an error message
    }
  });
}

function showStyleOPtions() {
  hideStylistSection();
  disableNextButtons();
  if ($(this).val() !== "null") {
    blockBookingPannel();
    let selectedStyle;

    for (style of styles) {
      if (style.baseStyle === $(this).val()) {
        selectedStyle = style;
        break;
      }
    }
    if (selectedStyle) {
      let htmlSelectOptions = '<option value="null" selected>Select Style Option</option>';
      for (option of selectedStyle.options) {
        htmlSelectOptions += '<option value="' + option.name + '">' + option.name + '</option>'
      }
      $("#selectOption").html(htmlSelectOptions);
      $("#selectOption").removeAttr("disabled");
      $('#selectOption').change(showStylistSection);
      showBookingPannel();
      // console.log(optionSelect);
    }
  } else {
    console.log("Base Selection Empty");
    $("#selectOption").val("null");
    $("#selectOption").attr("disabled", "");
  }
}


function blockBookingPannel() {
  $("#bookingForm").hide();
  $("#loadingSign").fadeIn('slow');
}

function showBookingPannel() {
  $("#loadingSign").hide();
  $("#bookingForm").fadeIn('slow');
}

function hideStylistSection() {
  $("#chooseStylistSection").hide();
  $("#nextTabButton").addClass("disabled");
}

function showStylistSection() {
  disableNextButtons();

  if ($(this).val() !== "null") {
    let stylistsHtml = '';
    let i = 0;
    $.get("/stylists", function(stylists) {
      if (stylists) {
        for (stylist of stylists) {
          stylistsHtml += '<div class="col text-center">' +
            '<input type="radio" onclick="selectStylist(this)" class="btn-check " name="stylisOption" id="option' + i + '" autocomplete="off">' +
            '<label class="btn btn-sylist" for="option' + i + '">' + stylist.name + '</label>' +
            '</div>';
          i++;
        }
        $("#stylistContainer").html(stylistsHtml);
        $("#chooseStylistSection").fadeIn("slow");
      }
    })
  } else {
    console.log("Optiion Selection Empty");
    hideStylistSection();
  }
}

function selectStylist(evt) {
  clearOtherStylistSelection();
  let btn = $(evt.nextSibling);
  btn.addClass("bg-accent text-white");
  $("#stylist").val(btn.text());
  $("#nextTabButton").removeClass("disabled");
}

function disableAllButtons() {
  $("#nextTabButton").addClass("disabled");
  $("#previousTabButton").addClass("disabled");
  $("#addToCart").addClass("disabled");
}

function disableNextButtons() {
  $("#nextTabButton").addClass("disabled");
}

function enableNextButtons() {
  $("#nextTabButton").removeClass("disabled");
}

function disablePrevioustButton() {
  $("#previousTabButton").addClass("disabled");
}

function enablePrevioustButton() {
  $("#previousTabButton").removeClass("disabled");
}

function clearOtherStylistSelection() {
  for (element of $(".btn-sylist")) {
    $(element).removeClass("bg-accent text-white");
  }
  $("#stylist").val("");
}


function setProgress() {
  switch (bookingStage) {
    case 1:
      $("#progress").width("33.3%");
      break;
    case 2:
      $("#progress").width("66.7%");
      break;
    case 3:
      $("#progress").width("99.9%");
      break;
  }
}
