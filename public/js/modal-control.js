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
    // console.log("next Stage is " + (bookingStage + 1));
    bookingStage++;
    setProgress();
    if (bookingStage == 2) {
      // console.log("on page 2");
      showCalendar(new Date().getMonth());
    }
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
  showCalendar(new Date().getMonth())
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

function showCalendar(month) {

  // $.get("/days/" + $('#stylist').val() + "/"+month, function(days) {
  $.get("/days/Susan/"+month, function(days) {
    let i = 0; // max = days.length
    let today = new Date();
    displayMonth(days[i]);
    let calendarHead = '<div class="row text-center calendar-header border-bottom bg-light">' +
      '<div class="col sunday d-none d-sm-block px-0"> Sun </div>' +
      '<div class="col px-0"> Mon</div>' +
      '<div class="col px-0"> Tue </div>' +
      '<div class="col px-0"> Wed </div>' +
      '<div class="col px-0"> Thu </div>' +
      '<div class="col px-0"> Fri </div>' +
      '<div class="col px-0"> Sat </div>' +
      '</div>';

    $('#calendar').html(calendarHead);//calendarDatesHtml);

    console.log(days);
    while ( i < days.length ) {
      let dayObj = days[i];
      let date = new Date(dayObj.date);
      let c = 0;
      calendarDatesHtml = '<div class="row text-center border-bottom">';
      for (c; c < 7; c++) {
        if(c === date.getDay() ){
          i++;
            if(date.getDay() === 0){
              calendarDatesHtml += '<div class="col sunday d-none d-sm-block px-0"> ' + i + ' </div>';
            }else{
              let available = (dayObj.availableTimes.length > 0 )? true : false;
              console.log(available);
              if(available){
                calendarDatesHtml += '<div class="col " value="'+i+'" onclick="selectDate(this)"> ' + i + ' </div>';
              }else{
                calendarDatesHtml += '<div class="col date-muted" value="'+i+'" "> ' + i + ' </div>';

                // calendarDatesHtml += '<div class="col date-muted" value="'+i+'> ' + i + ' </div>';
              }
            }
            dayObj = days[i];
            if(dayObj){
              console.log(dayObj + " # ---> "+i);
              date = new Date(dayObj.date);
            }
        }else{
          if(c === 0){
            calendarDatesHtml += '<div class="col sunday d-none d-sm-block px-0"> &nbsp; </div>';
          }else{
            calendarDatesHtml += '<div class="col date-muted"> &nbsp; </div>';
          }
        }
      }
      $('#calendar').append(calendarDatesHtml + '</div>');
      calendarDatesHtml = "";

    }

  });
}

function displayMonth(day){
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date(day.date);
  const today = new Date();
  $("#monthDisplay").val(monthNames[d.getMonth()] + " " +d.getFullYear());

  const nextMonth = d.getMonth()+1;
  if(today.getMonth()+1 > d.getMonth()){
    $("#nextMonthButton").val(nextMonth);
    $("#nextMonthButton").removeAttr("disabled");
  }else{
    $("#nextMonthButton").attr("disabled","");
  }

  const prevMonth = d.getMonth()-1;
  if(today.getMonth() < d.getMonth()){
    $("#prevMonthButton").val(prevMonth);
    $("#prevMonthButton").removeAttr("disabled");
  }else{
    $("#prevMonthButton").attr("disabled","");
  }
}

function selectDate(evt){
  let selectedDate = new Date(new Date().getFullYear(), new Date().getMonth() , $(evt).attr("value"));
  $("#selectedDate").val(selectedDate.toLocaleDateString());
}

function nextMonth(evt){
  showCalendar($(evt).attr("value"));
  console.log($(evt).attr("value"));
}

function previousMonth(evt){
  console.log($(evt).attr("value"));
  showCalendar($(evt).attr("value"));
}
