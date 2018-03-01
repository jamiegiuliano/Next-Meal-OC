$(document).ready(initializeApp);

var model = {
    meal_array: [],
    day: '',
    meal: '',
    dayArr: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ],

    mealObj: {
        "All Day": "all",
        "Breakfast": "breakfast",
        "Lunch": "lunch",
        "Dinner": "dinner"
    }
};

function initializeApp(){
    addClickHandlersToElements();
    retrieveTodaysMeals();
}

function addClickHandlersToElements(){
    $('.find-food-btn').click(retrieveRequestedMeals);
}

function formatTime(time){
    if(!time){
        return;
    }
    var timeArray = time.split(":");
    var hours = parseInt(timeArray[0]);
    var minutes = parseInt(timeArray[1]);

    if (hours >= 12){
        meridianIndicator = "PM";
    } else {
        meridianIndicator = "AM";
    }

    if (hours > 12) {
        hours = hours - 12;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    var timeString = hours + ":" + minutes + " " + meridianIndicator;

    return timeString;
}

function formatNowString(hours, minutes){
    var nowString = "";
    if (hours < 10) {
        nowString = nowString + "0";
    }
    nowString = nowString + hours + ":";

    if (minutes < 10) {
        nowString = nowString + "0";
    }
    nowString = nowString + minutes + ":00";
    return nowString;
}

function retrieveTodaysMeals(){

    model.meal_array = [];

    var date = new Date();

    var today = date.getDay();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    var nowString = formatNowString(hours, minutes);
    console.log(nowString);


    var dataToSend = {
        search_day: today,
        search_time: nowString
    };

    var ajaxOptions = {
        method: 'get',
        dataType: 'json',
        data: dataToSend,
        url: './php/read.php',
        success: functionToRunOnSuccess,
        error: functionToRunOnError
    };

    function functionToRunOnError(error){
        $('.loader-container').hide();
        alert('There was an error retrieving your data', error);
    }

    function functionToRunOnSuccess(data){
        getCoordinates(data.data, "first");
        $('.loader-container').hide();

        for (var i=0; i < data.data.length; i++){
            model.meal_array.push(data.data[i]);
            updateMealList(model.meal_array);
        }
    }

    $.ajax( ajaxOptions );
    $('button').removeClass('waiting');
}

function retrieveRequestedMeals(){
    $('tbody').empty();
    model.meal_array = [];

    var day = $('#day option:selected').text();

    if (day === "Today"){
        var date = new Date();
        model.day = date.getDay();
    } else if (day === "Tomorrow"){
        var date = new Date();
        var day = date.getDay();
        if (day === 6){
            model.day = 0;
        } else {
            model.day = date.getDay() + 1;
        }
    } else {
        model.day = model.dayArr.indexOf(day);
    }


    var meal = $('#meal option:selected').text();
    model.meal = model.mealObj[meal];
    console.log(model.meal);

    var dataToSend = {
        search_day: model.day,
        meal_time: model.meal
    };

    var ajaxOptions = {
        method: 'get',
        dataType: 'json',
        data: dataToSend,
        url: './php/search.php',
        success: functionToRunOnSuccess,
        error: functionToRunOnError
    };

    function functionToRunOnError(error){
        $('.loader-container').hide();
        alert('There was an error retrieving your data', error);
    }

    function functionToRunOnSuccess(data){
        $('.loader-container').hide();
        getCoordinates(data.data, "first");
        $('.loader').hide();

        for (var i=0; i < data.data.length; i++){
            model.meal_array.push(data.data[i]);
            updateMealList(model.meal_array);
        }
    }

    $.ajax( ajaxOptions );
    $('button').removeClass('waiting');
}

function updateMealList(meals){
    if (!meals[0]){
        $('.default-text').show();
        return;
    }


    renderMealsToDom(meals[meals.length-1]);
}

function renderMealsToDom(locationObj){
    $('.default-text').hide();
    var newTableRow = $('<tr>');
    $('tbody').append(newTableRow);
    var newProgram = $('<td>').text(locationObj.agency + " : " + locationObj.program);
    var startTime = formatTime(locationObj.time);
    var endTime = formatTime(locationObj.end_time);
    var newTime = $('<td>').text((startTime) + (endTime ? ("-" + endTime) : ''));
    var newCity = $('<td>').text(locationObj.city);
    var newInfoBtn = $('<button>', {
        'class': 'btn btn-sm teal-bg',
        'text': 'See Info',
        'data-toggle': 'modal',
        'data-target': '#info-modal'
    });
    var newBtnTD = $('<td>');

    (function(){
        newInfoBtn.click(function(){
            retrieveBasicInfo(locationObj.id);
            retrieveHours(locationObj.agency);
        });
    })();

    $(newTableRow).append(newProgram);
    $(newTableRow).append(newTime);
    $(newTableRow).append(newCity);
    $(newTableRow).append(newBtnTD);
    $(newBtnTD).append(newInfoBtn);
}

function retrieveBasicInfo(id){

    var dataToSend = {
        id: id
    };

    var ajaxOptions = {
        method: 'get',
        dataType: 'json',
        data: dataToSend,
        url: './php/modal.php',
        success: functionToRunOnSuccess,
        error: functionToRunOnError
    };

    function functionToRunOnError(error){
        console.log("There was an error retrieving this information. ", error);
    }

    function functionToRunOnSuccess(data){
        var result = data.data[0];

        getCoordinates(data.data, "modal");

        $('#agency').text(result.agency);
        $('#program').text(result.program);


        $('#address').text(result.address);

        var phone  = $('<a>').attr("href", "tel:"+result.phone).text(result.phone);
        $('#phone').empty();
        $('#phone').append(phone);

        var website = $('<a>').attr("href", result.website).text("Click Here For Website.");
        $('#website').empty();
        $('#website').append(website);
        $('#eligibility').text(result.eligibility);
        $('#docs').text(result.documentation);



    }

    $.ajax( ajaxOptions );
    $('button').removeClass('waiting');
}

function retrieveHours(agency){
    var dataToSend = {
        agency: agency
    };

    var ajaxOptions = {
        method: 'get',
        dataType: 'json',
        data: dataToSend,
        url: './php/meal_hours.php',
        success: functionToRunOnSuccess,
        error: functionToRunOnError
    };

    function functionToRunOnError(error){
        console.log("There was an error retrieving this information. ", error);
    }

    function functionToRunOnSuccess(data){
        var dataArr = data.data;
        var dayTrackerArr = [];
        var days_i, hours_i, day_ul, day_li, formatted_hours, hours_ul, hours_li, result;

        day_ul = $('<ul>');
        $('#hours').empty();
        $('#hours').append(day_ul);

        for (days_i=0; days_i<dataArr.length; days_i++){
            result = dataArr[days_i];
            if (dayTrackerArr.indexOf(result.day) < 0) {
                dayTrackerArr.push(result.day);
                day_li = $('<li>').addClass('modal-day').text(model.dayArr[parseInt(result.day)]);
                hours_ul = $('<ul>').addClass(dayTrackerArr.indexOf(result.day)+'-day modal-hours');
                $('#hours > ul').append(day_li).append(hours_ul);
            }
            console.log("Tracker in days loop: ", dayTrackerArr);
        }


        for (hours_i=0; hours_i<dataArr.length; hours_i++){
            console.log("Tracker at top of hours: ", dayTrackerArr);
            result=dataArr[hours_i];
            if (result.end_time) {
                formatted_hours = formatTime(result.time) + "-" + formatTime(result.end_time);
            } else {
                formatted_hours = formatTime(result.time);
            }
            hours_li = $('<li>').text(formatted_hours);

            $('ul.'+dayTrackerArr.indexOf(result.day)+'-day').append(hours_li);
            console.log("index of day: ", dayTrackerArr.indexOf(result.day));

        }
        console.log("Tracker after hours: ", dayTrackerArr);

    }

    $.ajax( ajaxOptions );
}


