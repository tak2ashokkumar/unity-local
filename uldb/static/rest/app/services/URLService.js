var app = angular.module('uldb');

app.factory('URLService', [
    '$http',
    'Server',
    'URLModel',
    function ($http, Server, URLModel) {

        var url = "";
        var currentURL = {};
        var index = 1;

        var model = new URLModel(url);

        var GetSetURL = function (url) {

            if (index in currentURL && url == "") {
                url = currentURL[index];
                return url;
            }
            else {
                currentURL[index] = url;
                return true;
            }
        };


        return {
            model: model,
            url: url,
            GetSetURL: GetSetURL
        };
    }
]);


app.factory('URLModel', function () {

    return function (url) {

        this.index = 1;
        this.url = url;
        this.currentURL = {
            data: null
        };
    };
});
