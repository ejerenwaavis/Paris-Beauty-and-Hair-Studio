let bookingStage = 1;
let styles = [];
let daysArray = [];
let officialHours;
let selectedStyle;
let selectedOption;
let purchaseData;
let apptID;
let clientDetails = false;
$.get("/officialHours", function(hours) {
  officialHours = hours;
});

// $('.modal').on('hidden.bs.modal', function (e) {
//   console.log("Modal Clsoing");
// })

/********** Laucnh Modal ************/
function loadStyles() {
  blockBookingPannel();
  hideStylistSection();
  resetForm();
  let htmlSelectOptions = '<option value="null" selected>Select Base Style</option>';

  $.get("/getStyles", function(data) {
    if (data) {
      for (style of data) {
        htmlSelectOptions += '<option value="' + style.baseStyle + '">' + style.baseStyle + '</option>'
      }
      $("#styleSelect").html(htmlSelectOptions);
      $('#styleSelect').change(showStyleOPtions);
      showBookingPannel();
      // $("#nextTabButton").addClass("disabled");
      disableNextButton();
      // $("#previousTabButton").addClass("disabled");
      disablePrevioustButton();
      styles = data;
    } else {
      //keep spining the circle and display an error message
    }
  });
}


/********** 1st Form Segments Controls ************/
function editBookingFor() {
  $("#clientEmail").removeAttr("disabled");
  $("#clientName").removeAttr("disabled");
  $("#clientWarningSection").removeAttr("hidden");
  setTimeout(function() {
    $("#clientWarningSection").fadeOut(5000)
  }, 5000);
}

function hideStylistSection() {
  $("#chooseStylistSection").hide();
  // $("#nextTabButton").addClass("disabled");
  disableNextButton();
}

function clearOtherStylistSelection() {
  for (element of $(".btn-sylist")) {
    $(element).removeClass("bg-accent text-white");
  }
  $("#stylist").val("");
}

function selectStylist(evt) {
  clearOtherStylistSelection();
  let btn = $(evt.nextSibling);
  btn.addClass("bg-accent text-white");
  $("#stylist").val(btn.text());
  enableNextButton();
}

function showStyleOPtions() {
  hideStylistSection();
  disableNextButton();
  if ($(this).val() !== "null") {
    blockBookingPannel();


    for (style of styles) {
      if (style.baseStyle === $(this).val()) {
        selectedStyle = style;
        break;
      }
    }
    if (selectedStyle) {
      let htmlSelectOptions = '<option value="null" selected>Select Style Option</option>';
      for (option of selectedStyle.options) {
        htmlSelectOptions += '<option value="' + option.name + '"> ' + option.name + '&nbsp; ($' + option.price + ') </option>'
      }
      $("#selectOption").html(htmlSelectOptions);
      $("#selectOption").removeAttr("disabled");
      $('#selectOption').change(showStylistSection);
      showBookingPannel();
    }
  } else {
    // console.log("Base Selection Empty");
    $("#selectOption").val("null");
    $("#selectOption").attr("disabled", "");
  }
}

function showStylistSection() {
  disableNextButton();
  for (styleOption of selectedStyle.options) {
    if ($(this).val() === styleOption.name) {
      $("#priceDummy").html("<strong>$" + styleOption.price + "</strong>");
      $("#price").val(styleOption.price);
      $("#duration").val(styleOption.duration);
      selectedOption = styleOption;
    }
  }
  if ($(this).val() !== "null") {
    let stylistsHtml = '';
    let i = 0;
    $.get("/stylists", function(stylists) {
      if (stylists) {
        for (stylist of stylists) {
          stylistsHtml += '<div class="col text-center">' +
            '<input type="radio" onclick="selectStylist(this)" class="btn-check " id="option' + i + '" autocomplete="off">' +
            '<label class="btn btn-sylist" for="option' + i + '">' + stylist.name + '</label>' +
            '</div>';
          i++;
        }
        $("#stylistContainer").html(stylistsHtml);
        $("#chooseStylistSection").fadeIn("slow");
      }
    })
  } else {
    // console.log("Optiion Selection Empty");
    hideStylistSection();
  }
}



/************** 2nd Form Segment Controls ************/
function displayMonth(day) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date(day.date);
  const today = new Date();
  $("#monthDisplay").val(monthNames[d.getMonth()] + " " + d.getFullYear());
  $("[data-month]").attr("data-month", "" + d.getMonth());

  const nextMonth = d.getMonth() + 1;
  if (today.getMonth() + 1 > d.getMonth()) {
    $("#nextMonthButton").val(nextMonth);
    $("#nextMonthButton").removeAttr("disabled");
  } else {
    $("#nextMonthButton").attr("disabled", "");
  }

  const prevMonth = d.getMonth() - 1;
  if (today.getMonth() < d.getMonth()) {
    $("#prevMonthButton").val(prevMonth);
    $("#prevMonthButton").removeAttr("disabled");
  } else {
    $("#prevMonthButton").attr("disabled", "");
  }
}

function getMonthIndexAndYear() {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let split = $("#monthDisplay").val().split(" ");
  let wordMonth = split[0];
  let year = Number(split[1]);
  let monthIndex;
  for (i = 0; i < monthNames.length; i++) {
    if (wordMonth === monthNames[i]) {
      // console.log(monthNames[i] + " index is: " + i);
      monthIndex = i;
      break;
    }
  }
  return [monthIndex, year];
}

function hideTimePanel() {
  $("#collapseTime").collapse("hide");
}

function nextMonth(evt) {
  // console.log($(evt).attr("value"));

  showCalendar(getMonthIndexAndYear()[1], $(evt).attr("value"), selectedOption.duration);
}

function previousMonth(evt) {
  // console.log($(evt).attr("value"));
  showCalendar(getMonthIndexAndYear()[1], $(evt).attr("value"), selectedOption.duration);
}

function selectDate(evt) {
  let dateElement = $(evt);
  let selectedDate = new Date(getMonthIndexAndYear()[1], getMonthIndexAndYear()[0], dateElement.attr("value"));
  $("#selectedDate").val(selectedDate.toLocaleDateString());
  $("#date").val(selectedDate);
  $("#selectedDate").css("background-color", "transparent")
  $("#collapseTimeButton").removeAttr("disabled");
  $(".col.active").removeClass("active");
  dateElement.addClass("active");
}

function selectTime(evt) {
  let timeElement = $(evt);
  // let selectedTime = new Date(new Date().getFullYear(), new Date().getMonth() , dateElement.attr("value"));
  let selectedTime = JSON.parse(timeElement.attr("value"));
  $("#selectedTime").val(timeElement.attr("value"));
  $("#selectedTime").css("background-color", "transparent");

  $("#selectedTimeDummy").val(timeString(selectedTime));
  $("#selectedTimeDummy").css("background-color", "transparent");

  $("#time .col.active").removeClass("active");
  timeElement.addClass("active");

  enableNextButton();
}

function showCalendar(year, month, duration) {
  blockBookingPannel();
  // console.log("getting dates");
  $.get("/days/" + $('#stylist').val() + "/" + year + "/" + month + "/" + duration, function(days) {
    daysArray = days
    let i = 0; // max = days.length
    let today = new Date();
    displayMonth(days[i]);
    let calendarHead = '<div class="row text-center calendar-header border-bottom bg-light">' +
      '<div class="col sunday d-none d-sm-block px-0"> Sun </div>' +
      '<div class="col px-0"> Mon </div>' +
      '<div class="col px-0"> Tue </div>' +
      '<div class="col px-0"> Wed </div>' +
      '<div class="col px-0"> Thu </div>' +
      '<div class="col px-0"> Fri </div>' +
      '<div class="col px-0"> Sat </div>' +
      '</div>';

    $('#calendar').html(calendarHead); //calendarDatesHtml);

    // console.log(days);

    while (i < days.length) {
      let dayObj = days[i];
      let date = new Date(dayObj.date);
      let c = 0;
      calendarDatesHtml = '<div class="row text-center border-bottom">';
      for (c; c < 7; c++) {
        // console.log("C ==> "+ c +" | date ==> "+ date.getDay());
        if (c === date.getDay()) {
          i++;
          if (date.getDay() === 0) {
            calendarDatesHtml += '<div class="col sunday d-none d-sm-block px-0"> ' + i + ' </div>';
          } else {
            let available = (dayObj.availableTimes.length > 0) ? true : false;
            if (available && (compareDates(date, today) == 1)) {
              calendarDatesHtml += '<div class="col " value="' + i + '" onclick="selectDate(this)"> ' + i + ' </div>';
            } else if (available && (compareDates(date, today) == 0)) {
              calendarDatesHtml += '<div class="col today" value="' + i + '" onclick="selectDate(this)"> ' + i + ' </div>';
            } else {
              if ((compareDates(date, today) == 0)) {
                calendarDatesHtml += '<div class="col today date-muted" value="' + i + '" > ' + i + ' </div>';
              } else {
                calendarDatesHtml += '<div class="col date-muted" value="' + i + '" "> ' + i + ' </div>';
              }
            }
          }
          dayObj = days[i];
          if (dayObj) {
            date = new Date(dayObj.date);
          }
        } else {
          if (c === 0) {
            calendarDatesHtml += '<div class="col sunday d-none d-sm-block px-0"> &nbsp; </div>';
          } else {
            calendarDatesHtml += '<div class="col date-muted"> &nbsp; </div>';
          }
        }
      }
      $('#calendar').append(calendarDatesHtml + '</div>');
      calendarDatesHtml = "";

    }
    $("#collapseTime").collapse("hide");
    $("#collapseTimeButton").attr("disabled", "");
    $("#collapseCalendar").collapse("show");
    showBookingPannel();

  });
}

function showTimePanel() {
  let selectedDateRaw = new Date($("#selectedDate").val());
  let selectedDate = selectedDateRaw.toLocaleDateString();
  let selectDateDayObj = undefined;
  let today = new Date();
  let timeNow = {
    hrs: today.getHours(),
    mins: today.getMinutes()
  }; //addThirtyMins({hrs:new Date().getHours(), mins:new Date().getMinutes()})
  let dc = 0;
  for (day of daysArray) {
    date = new Date(day.date).toLocaleDateString();
    if (selectedDate === date) {
      selectDateDayObj = day;
      break;
    }
    dc++;
  }


  let compiledAvailableTimes = [];
  // console.log("Ready to compile available Times **********");
  for (time of selectDateDayObj.availableTimes) {
    // console.log("available time: ----> ");
    // console.log(time);
    compiledAvailableTimes = generateCompiledAvailableTimes(time.start, time.stop, compiledAvailableTimes);
  }
  let workTimes = generateWorkTimes(officialHours.start, officialHours.stop);

  // console.log(workTimes);
  // console.log(compiledAvailableTimes);
  // console.log((workTimes.length == compiledAvailableTimes.length));

  let timeHTML = "";
  $("#time").html(timeHTML);
  let i = 0;
  let badIndex = [];
  while (i < workTimes.length) {
    timeHTML = '<div class="row text-center border-bottom">';
    for (c = 0; c < 4; c++) {
      if (i == workTimes.length) {
        break;
      } //break out of the loop if i gets to max
      timeJsonString = JSON.stringify(workTimes[i]);
      // let currentTime = {hrs:new Date().getHours(),mins:new Date().getMinutes()}
      if ($.inArray(timeJsonString, compiledAvailableTimes) !== -1) {
        // console.log((compareDates(today,selectedDateRaw) == 0));
        // console.log(timeNow.hrs + " & " + workTimes[i].hrs + " : " + compareTimes(timeNow,workTimes[i]) );
        if ((compareDates(today, selectedDateRaw) == 0) && compareTimes(timeNow, workTimes[i]) == 1) {
          timeHTML += "<div class='col date-muted' array-index='" + i + "' value='" + timeJsonString + "' onclick='selectTime(this)'> " + timeString(workTimes[i]) + " </div>";
          i++;
        } else {
          timeHTML += "<div class='col' array-index='" + i + "' value='" + timeJsonString + "' onclick='selectTime(this)'> " + timeString(workTimes[i]) + " </div>";
          i++;
        }
      } else {
        timeHTML += "<div class='col  date-muted' array-index='" + i + "' value='" + timeJsonString + "' > " + timeString(workTimes[i]) + " </div>";
        badIndex.push((i - 1))
        i++;
      }
    }
    timeHTML += '</div>';
    $("#time").append(timeHTML);
    timeHTML = "";
  }
  blockBadIndexes(badIndex);
  $("#collapseCalendar").collapse("hide");
  $("#collapseTime").collapse("show");
}


/************** 3rd Form Segment Controls ************/
function showReviewSegment() {
  let form = $("#bookingForm").serializeArray();
  $("#baseStyleLabel").html($("#styleSelect").val());
  $("#optionLabel").html($("#selectOption").val());
  $("#stylistLabel").html($("#stylist").val());
  $("#dateLabel").html(new Date($("#selectedDate").val()).toLocaleDateString());
  $("#timeLabel").html($('#selectedTimeDummy').val());
  $("#totalPriceLabel").html("$" + $("#price").val());
  let deposit = $("#price").val() * 0.40;
  $("#depositLabel").html("$" + deposit);

}

function checkOut() {
  $("#payButton").attr("disabled", "") //disable pay button untill intnent is created
  checkoutBusy();
  switchPanes(4);
  // console.log("Checking Out");
  let body = {
    style: {
      baseStyle: $("#styleSelect").val(),
      option: $("#selectOption").val(),
    },
    price: Number($("#price").val()),
    date: $("#selectedDate").val(),
    time: JSON.parse($("#selectedTime").val()),
    stylist: $("#stylist").val(),
    duration: $("#duration").val(),
    clientEmail: $("#clientEmail").val(),
    clientName: $("#clientName").val()
  };
  let pricings;
  $.post("/orderPricings", body, function(res) {
    console.log(res);
    pricings = res;
    console.log(pricings);


    $.post("/appt", body, function(data) {
      // console.log(data);
      if (data.status === "success") {

        apptID = data.id;
        // console.log(data + " Appt Saved/Held");
        $("#processInfo").html("<span class='text-success'><strong>Booking Held for 5Mins:</strong> Coomplete payment to secure it.</span>");
        $("#processInfo2").html("Do not close this dialog until payment is completed.</span>");
        $("#processInfo").fadeIn("slow");
        setTimeout(function() {
          $("#processInfo").fadeOut(4000);
        }, 4000);
        bookingStage = 4;
        setProgress()
        checkoutDone();
        $(".modalButtons").hide();
        $("#checkOutBase").html(body.style.baseStyle);
        $("#checkOutOption").html(body.style.option);
        $("#checkOutDeposit").html((pricings.deposit / 100).toFixed(2));
        $("#checkOutTax").html((pricings.tax / 100).toFixed(2));
        $("#checkOutTotal").html((pricings.total / 100).toFixed(2));
        createPaymentIntent(pricings);
      } else {
        bookingStage = 3;
        switchPanes(bookingStage)
        setProgress()
        checkoutDone();
        $("#processInfo").html(data.message);
        $("#processInfo").fadeIn("slow");
        setTimeout(function() {
          $("#processInfo").fadeOut(4000);
        }, 4000);
      }
    });
  });
}

/***************** Timr Helper Functions ***************/
function addThirtyMins(time) {
  let hrs = time.hrs;
  let mins = time.mins + 30;
  if (mins > 59) {
    hrs += Math.floor(mins / 60)
    mins = mins % 60;
  }
  return {
    hrs: hrs,
    mins: mins
  }
}

function blockBadIndexes(badIndex) {
  for (i of badIndex) {
    if (i > -1) {
      $("[array-index='" + i + "']").removeAttr("onclick");
      $("[array-index='" + i + "']").addClass("date-muted");
    }
  }
}

function compareTimes(a, b) {
  let comparison = 0;
  if (a.hrs > b.hrs) {
    comparison = 1;
  } else if (a.hrs < b.hrs) {
    comparison = -1;
  } else if (a.hrs === b.hrs) {
    if (a.mins > b.mins) {
      comparison = 1;
    } else if (a.mins < b.mins) {
      comparison = -1;
    }
  }
  return comparison;
}

function compareDates(t, d) {
  let comparison = 0;
  if (t.getFullYear() > d.getFullYear()) {
    comparison = 1;
  } else if (t.getFullYear() < d.getFullYear()) {
    comparison = -1;
  } else if (t.getFullYear() === d.getFullYear()) {
    if (t.getMonth() > d.getMonth()) {
      comparison = 1;
    } else if (t.getMonth() < d.getMonth()) {
      comparison = -1;
    } else if (t.getMonth() == d.getMonth()) {
      if (t.getDate() > d.getDate()) {
        comparison = 1;
      } else if (t.getDate() < d.getDate()) {
        comparison = -1;
      }
    }
  }
  return comparison;
}

function generateCompiledAvailableTimes(start, stop, compiledArray) {
  // console.log("compiling Avaialable Times");
  compiledArray.push(JSON.stringify(start));
  let currentTime = start;
  let end = false;
  // console.log("before the 'generateCompiledTimes()' while loop");
  while (!end) {
    currentTime = addThirtyMins(currentTime);
    compiledArray.push(JSON.stringify(currentTime));
    // console.log(compareTimes(currentTime,stop) === 0);
    if (compareTimes(currentTime, stop) === 0) {
      end = true;
    }
  }
  // console.log("After the 'generateCompiledTimes()' while loop");

  return compiledArray;
}

function generateWorkTimes(start, stop) {
  let times = [start];
  let currentTime = start;
  let end = false;
  while (!end) {
    currentTime = addThirtyMins(currentTime);
    times.push(currentTime)
    if (compareTimes(currentTime, stop) === 0) {
      end = true;
    }
  }
  return times;
}

function timeString(time) {
  if (time) {

    if (time.hrs > 11) {
      return "" + ((time.hrs - 12 === 0) ? 12 : ((time.hrs - 12) > 9) ? (time.hrs - 12) : "0" + (time.hrs - 12)) + ":" + ((time.mins < 10) ? "0" + time.mins : time.mins) + "pm";
    } else {
      return "" + ((time.hrs > 9) ? time.hrs : "0" + time.hrs) + ":" + ((time.mins < 10) ? "0" + time.mins : time.mins) + "am";
    }
  } else {
    console.log("undefined time");
  }
}




/********** Modal Pane Controls ************/
function blockBookingPannel() {
  $("#bookingForm").hide();
  $("#loadingSign").removeClass("d-none");
  $("#loadingSign").fadeIn('fast');
}

function closeReviewModal(evt) {
  $("#review").modal('hide');
  $('#booking-form-modal').modal('show');
  // $('#booking-form-modal').handleUpdate();
}

function showNextTab() {
  if (bookingStage < 4) {
    if (bookingStage == 1) {
      let clientName = $("#clientName").val();
      let clientEmail = $("#clientEmail").val();
      if (clientName && clientEmail) {
        clientDetails = true;
      } else {
        clientDetails = false;
      }
    }
    if (clientDetails) {
      var triggerEl = $('a[href="#stage' + (bookingStage + 1) + '-pane"]')
      triggerEl.tab('show'); // Select tab by name


      disableNextButton();
      enablePrevioustButton();
      // console.log("next Stage is " + (bookingStage + 1));
      bookingStage++;
      setProgress();
      if (bookingStage == 2) {
        // console.log("on page 2");
        $.get("/officialHours", function(hours) {
          officialHours = hours;
        });
        showCalendar(new Date().getFullYear(), new Date().getMonth(), selectedOption.duration);
        switchPanes(bookingStage);
      } else if (bookingStage == 3) {
        enableNextButton()
        $("#nextTabButton").html("Proceed to Checkout <i class='fas fa-lock d-none d-sm-inline-block' aria-hidden='true'></i>");
        $("#nextTabButton").attr("onClick", "showNextTab()");
        // $("#addToCart").removeClass("disabled");
        showReviewSegment();
      } else if (bookingStage == 4) {
        enableNextButton()
        // $("#nextTabButton").html("Pay <i class='fas fa-lock'></i>");
        // $("#nextTabButton").attr("onClick", "checkOut()");
        // $(".modalButtons").hide();
        checkOut();
        // console.log("Handling Chckout Neede");
      }

    } else {
      $("#clientDetailsError").removeAttr("hidden");
      setTimeout(function() {
        $("#clientDetailsError").fadeOut(3000)
      }, 4000)
    }
  } else {
    console.log("Nothing Happend");
  }
}

function showPreviousTab() {
  if (bookingStage > 1) {
    if (bookingStage == 3) {
      // $("#addToCart").addClass("disabled");
      $("#nextTabButton").html("Continue");
      $("#nextTabButton").attr("onClick", "showNextTab()");
    } else if (bookingStage == 4) {
      $("#nextTabButton").html("Proceed to Checkout <i class='fas fa-lock d-none d-sm-inline-block' aria-hidden='true'></i>");
      $("#nextTabButton").attr("onClick", "showNextTab()");
    }
    var triggerEl = $('a[href="#stage' + (bookingStage - 1) + '-pane"]')
    triggerEl.tab('show'); // Select tab by name

    $("#stage" + bookingStage + "-dummy-link").addClass("disabled");
    $("#stage" + (bookingStage - 1) + "-dummy-link").removeClass("disabled")
    // console.log("next Stage is " + (bookingStage - 1));
    bookingStage--;
    enableNextButton();
    if (bookingStage == 1) {
      disablePrevioustButton()
    }
    // if(bookingStage < 3){
    //   $("#addTocart").addClass("disabled");
    // }
    $("#nextTabButton").removeClass("btn-accent");
    setProgress();
  } else {
    console.log("cant goo backwards anymore");
  }
}

function showBookingPannel() {
  $("#loadingSign").addClass("d-none");
  $("#loadingSign").hide();
  $("#bookingForm").fadeIn('slow');
}

function setProgress() {
  switch (bookingStage) {
    case 1:
      $("#progress").width("25%");
      $("#stage" + 2 + "-dummy-link").addClass("disabled");
      $("#stage" + 3 + "-dummy-link").addClass("disabled");
      $("#stage" + 4 + "-dummy-link").addClass("disabled");
      $("#stage" + 1 + "-dummy-link").removeClass("disabled");
      break;
    case 2:
      $("#progress").width("50%");
      $("#stage" + 1 + "-dummy-link").addClass("disabled");
      $("#stage" + 3 + "-dummy-link").addClass("disabled");
      $("#stage" + 4 + "-dummy-link").addClass("disabled");
      $("#stage" + 2 + "-dummy-link").removeClass("disabled");
      break;
    case 3:
      $("#progress").width("75%");
      $("#stage" + 1 + "-dummy-link").addClass("disabled");
      $("#stage" + 2 + "-dummy-link").addClass("disabled");
      $("#stage" + 4 + "-dummy-link").addClass("disabled");
      $("#stage" + 3 + "-dummy-link").removeClass("disabled");
      break;
    case 4:
      $("#progress").width("100%");
      $("#stage" + 1 + "-dummy-link").addClass("disabled");
      $("#stage" + 2 + "-dummy-link").addClass("disabled");
      $("#stage" + 3 + "-dummy-link").addClass("disabled");
      $("#stage" + 4 + "-dummy-link").removeClass("disabled");
      break;
  }
}

function resetForm() {
  disableAllButtons();
  $("#processInfo").hide();
  clearOtherStylistSelection();
  disableAllButtons();
  bookingStage = 1;
  setProgress();
  $("#bookingForm").find("select").val("null");
  $("#selectOption").attr("disabled", "");
  $(".modalButtons").show();
  switchPanes(bookingStage);
}

function switchPanes(stage) {
  switch (stage) {
    case 1:
      $("#stage2-pane").removeClass("show active");
      $("#stage3-pane").removeClass("show active");
      $("#stage4-pane").removeClass("show active");
      $("#stage1-pane").addClass("show active");
      break;
    case 2:
      $("#stage1-pane").removeClass("show active");
      $("#stage3-pane").removeClass("show active");
      $("#stage4-pane").removeClass("show active");
      $("#stage2-pane").addClass("show active");
      break;
    case 3:
      $("#stage1-pane").removeClass("show active");
      $("#stage2-pane").removeClass("show active");
      $("#stage4-pane").removeClass("show active");
      $("#stage3-pane").addClass("show active");

      break;
    case 4:
      $("#stage1-pane").removeClass("show active");
      $("#stage2-pane").removeClass("show active");
      $("#stage3-pane").removeClass("show active");
      $("#stage4-pane").addClass("show active");
      break;
    default:

  }
}

function goToReviewPane() {
  bookingStage = 3;
  switchPanes(bookingStage);
  setProgress();
  $(".modalButtons").fadeIn("fast");

}


/********** Button Controls ************/
function disableAllButtons() {
  disableNextButton();
  $("#previousTabButton").addClass("disabled");
  $("#addToCart").addClass("disabled");
}

function disableNextButton() {
  $("#nextTabButton").addClass("disabled");
  $("#nextTabButton").removeClass("btn-accent");
  $("#nextTabButton").attr("onClick", "showNextTab()");
  $("#nextTabButton").html("Continue");
}

function enableNextButton() {
  $("#nextTabButton").removeClass("disabled");
  $("#nextTabButton").addClass("btn-accent");
}

function disablePrevioustButton() {
  $("#previousTabButton").addClass("disabled");
}

function enablePrevioustButton() {
  $("#previousTabButton").removeClass("disabled");
}

function checkoutBusy() {
  $("#nextTabButton").addClass("disabled");
  $("#nextTabButton").html("Checking Out <i class='fas fa-circle-notch fa-spin'></i>");
  $("#nextTabButton").attr("onClick", "alert(busy)");
}

function checkoutDone() {
  $("#nextTabButton").removeClass("disabled");
  $("#nextTabButton").html("Proceed to Checkout <i class='fas fa-lock d-none d-sm-inline-block'></i>");
  $("#nextTabButton").attr("onClick", "checkOut()");
}
