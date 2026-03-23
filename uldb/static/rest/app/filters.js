/**
 * Created by rt on 9/23/15.
 */

var filter_app = angular.module('uldbfilters', []);
var app = angular.module('uldb');

filter_app.filter('unityDate', [
    '$filter',
    function ($filter) {
        return function (input_date, timezone) {
            if(input_date)
                return moment.tz(input_date, timezone).format('MMM DD, YYYY, HH:mm:ss');
            else
                return 'N/A';
        };
    }
]);

filter_app.filter('unityObserviumTime', [
    '$filter',
    function ($filter) {
        return function (input_timestamp) {
            if (input_timestamp){
                var days = Math.floor((input_timestamp/3600)/24);
                var hours = Math.floor(input_timestamp/3600) - days*24;
                var minutes = Math.floor((input_timestamp%3600)/60);
                var seconds = input_timestamp % 60;
                var time = '';
                if (days !== 0){
                    time = days+' days,';
                }
                return  time + ' ' + hours+'h'  + ' ' + minutes+'m'  + ' ' + seconds+'s';
            }
            else{
                return 'N/A';
            }

        };
    }
]);

filter_app.filter('unityHeading', [
    '$filter',
    function ($filter) {
        return function (input_heading) {
            if (input_heading){
                input_heading = input_heading.charAt(0).toUpperCase() + input_heading.slice(1);
                return  input_heading;
            }
            else{
                return 'N/A';
            }

        };
    }
]);

filter_app.filter('user_timezone_abbreviation', [
    '$filter',
    function ($filter) {
        return function () {
            var input_date_obj = new Date();
            var input_date_str = input_date_obj.toString();
            var local_tz = input_date_str.substring(input_date_str.lastIndexOf("(")+1, input_date_str.lastIndexOf(")"));
            
            // get initials from bigger format: e.g - Pacific Daylight Time
            if (local_tz.length>4){
                var temp = local_tz.split(' ');
                local_tz = temp[0][0] + temp[1][0] + temp[2][0];
            }
            return local_tz;
        };
    }
]);

filter_app.filter('tb_unit_check', [ '$filter',function($filter){
    return function(tb_unit){
        if (tb_unit){
            if(tb_unit < 1){
                tb_unit = tb_unit * 1024;
                if(!((tb_unit % 1) === 0)){
                    tb_unit = $filter('number')(tb_unit, 3);
                }
                return (tb_unit + ' GB');
            }else{
                if(!((tb_unit % 1) === 0)){
                    tb_unit = $filter('number')(tb_unit, 3);
                }
                return (tb_unit + ' TB');
            }

        }else{
            return 'N/A';
        }
    };
}]);

filter_app.filter('gb_unit_check', [ '$filter',function($filter){
    return function(gb_unit){
        if (gb_unit){
            if(gb_unit < 1){
                gb_unit = gb_unit * 1024;
                if(!((gb_unit % 1) === 0)){
                    gb_unit = $filter('number')(gb_unit, 3);
                }
                return (gb_unit + ' MB');
            }else{
                if(!((gb_unit % 1) === 0)){
                    gb_unit = $filter('number')(gb_unit, 3);
                }
                return (gb_unit + ' GB');
            }

        }else{
            return 'N/A';
        }
    };
}]);


filter_app.filter('content_unit_check', [ '$filter',function($filter){
    return function(content, unit){
        if (content && content !== "N/A"){
            return (content + ' ' + unit);
        }else if(content === "N/A"){
            return 'N/A';
        }else{
            return 0 + ' ' + unit;
        }
    };
}]);

filter_app.filter('icinga_state', function () {
    return function (input) {
        var output = '';
        switch (input) {
            case '0':
                output = 'OK';
                break;
            case '1':
                output = 'CRITICAL';
                break;
            default:
                output = 'UNKNOWN';
        }
        return output;
    };
});


filter_app.filter('nagios_state', function () {
    return function (input) {
        var output = '';
        switch (input) {
            case 0:
                output = 'OK';
                break;
            case 1:
                output = 'WARNING';
                break;
            case 2:
                output = 'CRITICAL';
                break;
            default:
                output = 'UNKNOWN';
        }
        return output;
    };
});

filter_app.filter('nagios_host_state', function () {
    return function (input) {
        var output = '';
        var state_mapping = {
            1: 'PENDING',
            2: 'UP',
            4: 'DOWN',
            8: 'UNREACHABLE'
        };
        if (input in state_mapping) {
            output = state_mapping[input];
        }
        return output;
    };
});

filter_app.filter('nagios_service_state', function () {
    return function (input) {
        var output = '';
        var state_mapping = {
            1: 'PENDING',
            2: 'OK',
            4: 'WARNING',
            8: 'UNKNOWN',
            16: 'CRITICAL'
        };
        if (input in state_mapping) {
            output = state_mapping[input];
        }
        return output;
    };
});

filter_app.filter('title', function () {
    return function (string) {
        if (string != null) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        else {
            return '';
        }
    };
});

filter_app.filter('powerState', function () {
    return function (string) {
        if (string == "poweredOn" || string == "ACTIVE" || string == "running" || string == "VM running" || string == true) {
            return "On";
        }else if (string == "poweredOff" || string == "SHUTOFF" || string == "stopped" || string == "VM deallocated" ||
                string == "VM stopped" ||  string == "VM deallocating" || string == null || string == false ){
            return 'Off';
        }else {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };
});

filter_app.filter('BMServerpowerState', function () {
    return function (state) {
        if (state == true) {
            return "On";
        }else if (state == false ){
            return 'Off';
        }else if (state == null){
            return 'NA';
        }else {
            return state.charAt(0).toUpperCase() + state.slice(1);
        }
    };
});

filter_app.filter('returnNaWhenEmpty', [
    '$filter',
    function ($filter) {
        return function (data) {

            if (data === undefined || data === null ){
                return 'N/A';
            }
            else return data;
        };
    }
]);

app.filter('fullDate', [
    '$filter',
    function ($filter) {
        return function (date) {
            return $filter('date')(date, 'MMMM d, y h:mm:ss a');
        };
    }
]);


// Given a list that looks like
//    [ {name: '1.1'}, {name: '1.2'}, [..] ]
//    (Array of Object with common attribute)
// Produces
// => "1.1, 1.2"
//    (String)
// Subattr is the common attribute here
app.filter('commaReduce', function () {
    return function (input, subattr) {
        if (!angular.isDefined(input)) {
            return '';
        }
        return input.filter(function (e, i, arr) {
            return (e.hasOwnProperty(subattr));
        }).map(function (e, i, arr) {
            return e[subattr];
        }).reduce(function (acc, e, i, arr) {
            if (acc === '') {
                return e;
            }
            return acc + ', ' + e;
        }, '');
    };
});


app.filter('firstMatch', function () {
    return function (input, regex) {
        var _m = input.match(new RegExp(regex));
        if (_m && _m.length > 0) {
            return _m[1];
        }
        return '';
    };
});

app.filter('strLimit', ['$filter', function($filter) {
   return function(input, limit) {
      if (! input) return;
      if (input.length <= limit) {
          return input;
      }

      return $filter('limitTo')(input, limit) + '...';
   };
}]);

filter_app.filter('CtoFHT', [
    '$filter',
    function ($filter) {
        return function (input_temperature) {
            if (input_temperature){
                return (input_temperature * 9 / 5) + 32;
            }
            else{
                return 'N/A';
            }

        };
    }
]);


filter_app.filter('AWSRegionFilter', [
    '$filter',
    function ($filter) {
        return function (region, AWS_REGIONS) {
            for (var i=0; i<AWS_REGIONS.length; i++){
                if(AWS_REGIONS[i].short == region){
                    return AWS_REGIONS[i].long;
                }
            }
            return region;
        };
    }
]);

filter_app.filter('Filesize', [
    '$filter',
    function ($filter) {
        return function (size) {
            console.log("Size :",size);
            if (isNaN(size))
                size = 0;

            if (size < 1024)
                return size + ' Bytes';

            size /= 1024;

            if (size < 1024)
                return size.toFixed(2) + ' KB';

            size /= 1024;

            if (size < 1024)
                return size.toFixed(2) + ' MB';

            size /= 1024;

            if (size < 1024)
                return size.toFixed(2) + ' GB';

            size /= 1024;

            return size.toFixed(2) + ' TB';
        };
    }
]);

