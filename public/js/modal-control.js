let bookingStage = 1;
let styles = [];


function closeReviewModal(evt) {
  $("#review").modal('hide');
  $('#booking-form-modal').modal('show');
  // $('#booking-form-modal').handleUpdate();
}


function showNextTab() {
  var triggerEl = $('a[href="#stage' + bookingStage + '-pane"]')
  triggerEl.tab('show'); // Select tab by name
}


function loadStyles() {
  blockBookingPannel();
  hideStylistSection();
  let htmlSelectOptions = '<option selected>Select Base Style</option>';

  $.get("/getStyles", function(data) {
    if (data) {
      for (style of data) {
        htmlSelectOptions += '<option value="' + style.baseStyle + '">' + style.baseStyle + '</option>'
      }
      $("#styleSelect").html(htmlSelectOptions);
      $('#styleSelect').change(showStyleOPtions);
      showBookingPannel();
      styles = data;
    } else {
      //keep spining the circle and display an error message
    }
  });
}

function showStyleOPtions() {
  blockBookingPannel();
  let selectedStyle;
  for (style of styles) {
    if (style.baseStyle === $(this).val()) {
      selectedStyle = style;
      break;
    }
  }
  if (selectedStyle) {
    let htmlSelectOptions = '<option selected>Select Style Option</option>';
    for (option of selectedStyle.options) {
      htmlSelectOptions += '<option value="' + option.name + '">' + option.name + '</option>'
    }
    $("#selectOption").html(htmlSelectOptions);
    $("#selectOption").removeAttr("disabled");
    $('#selectOption').change(showStylistSection);
    showBookingPannel();
    // console.log(optionSelect);
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
}

function showStylistSection() {
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
}

function selectStylist(evt){
  clearOtherStylistSelection();
  let btn = $(evt.nextSibling);
  btn.addClass("bg-accent text-white");
  $("#stylist").val(btn.text());
}

function clearOtherStylistSelection(){
  for(element of $(".btn-sylist")){
    $(element).removeClass("bg-accent text-white");
  }
}
