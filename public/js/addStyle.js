

function addOption(evt) {
  let element = $("#option-container");
  let options = new Promise(function(resolve,reject){
    opts = getOptions();
    resolve(opts);
  });
  options.then(function(opts){
    let newHTML = generateOPtionTextFields(opts);
    if(newHTML){
      element.html(newHTML);
    }
  })
}


function generateOPtionTextFields(options) {
  let htmlStr = '';
  for (option of options) {
    if (option.name && option.price && option.duration) {
      htmlStr += '' +
        '<div class="mb-3  row">' +
        '<div class="col-xs-12 col-md-7  mb-3 mb-sm-3 mb-md-0 mb-lg-0">' +
        '<input type="text" name="option" value="' + option.name + '" class="form-control">' +
        '</div>' +
        '<div class=" col-xs-12 col-md-5 ">' +
        '<div class="row gx-2">' +
        '<div class="col-12 col-sm-6 mb-3 mb-sm-0 mb-md-0 mb-lg-0">' +
        '<div class="input-group">' +
        '<a class="btn btn-outline-secondary">$</a>' +
        '<input type="number" name="price" value="' + option.price + '" class="form-control" id="price">' +
        '</div>' +
        '</div>' +
        '<div class="col-12 col-sm-6">' +
        '<div class="input-group">' +
        '<a class="btn btn-outline-secondary "><i class="far fa-clock"></i></a>' +
        '<input type="number" name="duration" value="' + option.duration + '" class="form-control" id="price">' +
        '</div>' +
        '</div>  </div>  </div>   </div>';
    }
  }
  if(htmlStr){
    htmlStr += generateEmptyOPtionTextField();
  }
    return htmlStr;
}


function generateEmptyOPtionTextField() {
  let htmlStr = '' +
    '<div class="mb-3  row">' +
    '<div class="col-xs-12 col-md-7  mb-3 mb-sm-3 mb-md-0 mb-lg-0">' +
    '<input type="text" name="option" class="form-control">' +
    '</div>' +
    '<div class=" col-xs-12 col-md-5 ">' +
    '<div class="row gx-2">' +
    '<div class="col-12 col-sm-6 mb-3 mb-sm-0 mb-md-0 mb-lg-0">' +
    '<div class="input-group">' +
    '<a class="btn btn-outline-secondary">$</a>' +
    '<input type="number" name="price" class="form-control" id="price">' +
    '</div>' +
    '</div>' +
    '<div class="col-12 col-sm-6">' +
    '<div class="input-group ">' +
    '<a class="btn btn-outline-secondary "><i class="far fa-clock"></i></a>' +
    '<input type="number" value=240 name="duration" class="form-control" id="price">' +
    '<a onclick="addOption()" class="btn btn-outline-secondary" id="button-addon2">+</a>' +
    '</div>' +
    '</div>  </div>  </div>   </div>';
  return htmlStr;
}

function sendForm(evt){
  $("#options").text(JSON.stringify(getOptions()));
  let baseStyle = $("#baseStyle")[0].value;
  console.log(baseStyle);
  $("#styleName").val(baseStyle);
  $("#mainForm").submit();
}

function getOptions() {
  let arrayOfOptions = $("#option-container").find(":input").serializeArray();
  // console.log(arrayOfOptions);
  let options = [];
  let stop = false;

  while(!stop){
    let option = {
      name: arrayOfOptions.shift().value,
      price: arrayOfOptions.shift().value,
      duration: arrayOfOptions.shift().value
    }
    console.log(option);
    if(option.name && option.price && option.duration){
      options.push(option);
    }
    if(arrayOfOptions.length === 0){
      stop == true;
      break;
    }
  }

  console.log(options);
  return options;
}
