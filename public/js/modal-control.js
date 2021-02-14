let bookingStage = 1;
let styles = [];
let daysArray = [];
let officialHours;
let selectedStyle;
let selectedOption;
$.get("/officialHours",function(hours){
  officialHours = hours;
});


/********** Laucnh Modal ************/
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


/********** 1st Form Segments Controls ************/
function hideStylistSection() {
  $("#chooseStylistSection").hide();
  $("#nextTabButton").addClass("disabled");
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
  $("#nextTabButton").removeClass("disabled");
}
function showStyleOPtions() {
  hideStylistSection();
  disableNextButtons();
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
        htmlSelectOptions += '<option value="' + option.name + '"> ' + option.name + '&nbsp; ($' + option.price +') </option>'
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
function showStylistSection() {
  disableNextButtons();
  for (styleOption of selectedStyle.options){
    if($(this).val() === styleOption.name){
        $("#priceDummy").html("<strong>$"+styleOption.price+"</strong>");
        $("#price").val(styleOption.price);
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
    console.log("Optiion Selection Empty");
    hideStylistSection();
  }
}



/************** 2ns Form Segment Controls ************/
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
function hideTimePanel(){
    $("#collapseTime").collapse("hide");
}
function nextMonth(evt){
  showCalendar($(evt).attr("value"));
  // console.log($(evt).attr("value"));
}
function previousMonth(evt){
    // console.log($(evt).attr("value"));
    showCalendar($(evt).attr("value"));
}
function selectDate(evt){
    let dateElement = $(evt);
    let selectedDate = new Date(new Date().getFullYear(), new Date().getMonth() , dateElement.attr("value"));
    $("#selectedDate").val(selectedDate.toLocaleDateString());
    $("#date").val(selectedDate.toLocaleDateString());
    $("#selectedDate").css("background-color", "transparent")
    $("#collapseTimeButton").removeAttr("disabled");
    $(".col.active").removeClass("active");
    dateElement.addClass("active");
}
function selectTime(evt){
    let timeElement = $(evt);
    // let selectedTime = new Date(new Date().getFullYear(), new Date().getMonth() , dateElement.attr("value"));
    let selectedTime = JSON.parse(timeElement.attr("value"));
    $("#selectedTime").val(timeElement.attr("value"));
    $("#selectedTime").css("background-color", "transparent");

    $("#selectedTimeDummy").val(timeString(selectedTime));
    $("#selectedTimeDummy").css("background-color", "transparent");

    $("#time .col.active").removeClass("active");
    timeElement.addClass("active");

    enableNextButtons();
}
function showCalendar(month,duration) {

  // $.get("/days/" + $('#stylist').val() + "/"+month, function(days) {
    $.get("/days/Susan/"+month+"/"+duration, function(days) {
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

      $('#calendar').html(calendarHead);//calendarDatesHtml);

      // console.log(days);
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
              if(available){
                calendarDatesHtml += '<div class="col " value="'+i+'" onclick="selectDate(this)"> ' + i + ' </div>';
              }else{
                calendarDatesHtml += '<div class="col date-muted" value="'+i+'" "> ' + i + ' </div>';
              }
            }
            dayObj = days[i];
            if(dayObj){
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
function showTimePanel(){
    let selectedDate = new Date($("#selectedDate").val()).toLocaleDateString();
    let selectDateDayObj = undefined;
    for(day of daysArray){
      date = new Date(day.date).toLocaleDateString();
      if(selectedDate === date){
        selectDateDayObj = day;
        break;
      }
    }
    let compiledAvailableTimes = [];
    for(time of selectDateDayObj.availableTimes){
      compiledAvailableTimes = generateCompiledAvailableTimes(time.start,time.stop, compiledAvailableTimes);
    }
    let workTimes = generateWorkTimes(officialHours.start, officialHours.stop);

    // console.log(workTimes);
    // console.log(compiledAvailableTimes);
    // console.log((workTimes.length == compiledAvailableTimes.length));

    let timeHTML = "";
    $("#time").html(timeHTML);
    let i=0;
    let badIndex = [];
    while(i < workTimes.length){
      timeHTML = '<div class="row text-center border-bottom">';
      for(c=0;c<4;c++){
        if(i == workTimes.length){
          break;
        } //break out of the loop if i gets to max
        timeJsonString = JSON.stringify(workTimes[i]);
        if($.inArray(timeJsonString, compiledAvailableTimes) !== -1 ){
          timeHTML += "<div class='col' array-index='"+i+"' value='"+timeJsonString+"' onclick='selectTime(this)'> "+timeString(workTimes[i])+" </div>";
          i++;
        }else{
          timeHTML += "<div class='col  date-muted' array-index='"+i+"' value='"+timeJsonString+"' > "+timeString(workTimes[i])+" </div>";
          badIndex.push((i-1))
          i++;
        }
      }
      timeHTML += '</div>';
      $("#time").append(timeHTML );
      timeHTML = "";
    }
    blockBadIndexes(badIndex);
    $("#collapseCalendar").collapse("hide");
    $("#collapseTime").collapse("show");
}


/************** 3rd Form Segment Controls ************/
function showReviewSegment(){
  let form = $("#bookingForm").serializeArray();
  $("#baseStyleLabel").html(form[0].value);
  $("#optionLabel").html(form[1].value);
  $("#stylistLabel").html(form[3].value);
  $("#dateLabel").html(form[4].value);
  $("#timeLabel").html($('#selectedTimeDummy').val());
  $("#totalPriceLabel").html("$"+form[2].value);
  let deposit = form[2].value * 0.40;
  $("#depositLabel").html("$"+deposit);

}


/***************** Timr Helper Functions ***************/
function addThirtyMins(time){
  let hrs = time.hrs;
  let mins = time.mins + 30;
  if(mins > 59){
    hrs += Math.floor(mins/60)
    mins = mins%60;
  }
  return {hrs:hrs, mins:mins}
}
function blockBadIndexes(badIndex){
  for(i of badIndex){
    if(i > -1){
      $("[array-index='"+i+"']").removeAttr("onclick");
      $("[array-index='"+i+"']").addClass("date-muted");
    }
  }
}
function compareTimes(a,b){
  let comparison = 0;
  if (a.hrs > b.hrs) {
    comparison = 1;
  } else if (a.hrs < b.hrs) {
    comparison = -1;
  } else if (a.hrs === b.hrs ){
    if (a.mins > b.mins) {
      comparison = 1;
    } else if (a.mins < b.mins) {
      comparison = -1;
    }
  }
  return comparison;
}
function generateCompiledAvailableTimes(start, stop, compiledArray){

  compiledArray.push(JSON.stringify(start));
  let currentTime = start;
  let end = false;
  while(!end){
    currentTime = addThirtyMins(currentTime);
    compiledArray.push(JSON.stringify(currentTime));
    if(compareTimes(currentTime,stop) === 0){
      end = true;
    }
  }
  return compiledArray;
}
function generateWorkTimes(start,stop){
  let times = [start];
  let currentTime = start;
  let end = false;
  while(!end){
    currentTime = addThirtyMins(currentTime);
    times.push(currentTime)
    if(compareTimes(currentTime,stop) === 0){
      end = true;
    }
  }
  return times;
}
function timeString(time){
  if(time){

    if(time.hrs>11){
      return ""+((time.hrs-12 === 0)? 12 : ((time.hrs-12) > 9)?(time.hrs-12):"0"+(time.hrs-12))+":"+((time.mins < 10)? "0"+time.mins:time.mins) + "pm";
    }else{
      return ""+((time.hrs > 9)?time.hrs:"0"+time.hrs)+":"+((time.mins < 10)? "0"+time.mins:time.mins) + "am";
    }
  }else{
    console.log("undefined time");
  }
}




/********** Modal Pane Controls ************/
function blockBookingPannel() {
  $("#bookingForm").hide();
  $("#loadingSign").fadeIn('slow');
}
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
      $.get("/officialHours",function(hours){
        officialHours = hours;
      });
      showCalendar(new Date().getMonth());
    }else if (bookingStage == 3) {
      enableNextButtons()
      $("#nextTabButton").html("Checkout <i class='fas fa-lock'></i>");
      $("#addToCart").removeClass("disabled");
      showReviewSegment();
    }
  } else {
    console.log("Checkout needed");
  }
}
function showPreviousTab() {
  if (bookingStage > 1) {
    if(bookingStage==3){
      $("#addToCart").addClass("disabled");
      $("#nextTabButton").html("Continue");
    }
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
    if(bookingStage < 3){
      $("#addTocart").addClass("disabled");
    }
    setProgress();
  } else {
    console.log("cant goo backwards anymore");
  }
}
function showBookingPannel() {
  $("#loadingSign").hide();
  $("#bookingForm").fadeIn('slow');
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


/********** Button Controls ************/
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
