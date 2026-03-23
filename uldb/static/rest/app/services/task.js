var app = angular.module('uldb');

app.factory('TaskService', [
    '$timeout',
    '$http',
    function ($timeout, $http) {

        var processTaskv3 = function (task_id, _on_success, _on_failure, _max_attempts) {
            _max_attempts = typeof _max_attempts !== 'undefined' ? _max_attempts : 200;
            $http.get('/task/' + task_id + '/').then(function (response) {
                if (response.data.state === 'SUCCESS') {
                    return _on_success(response.data);
                } else if (response.data.state === 'FAILURE') {
                    return _on_failure(response);
                } else {
                    // successful HTTP request, but message is not SUCCESS
                    // if it's not SUCCESS, just wait 2 seconds and try again
                    if (--_max_attempts) {
                        $timeout(processTaskv3, 1000, true, task_id, _on_success, _on_failure, _max_attempts);
                    } else {
                        _on_failure('task expired: ' + task_id);
                    }
                }
            }, function (error) {
                console.log(error);
                return _on_failure(error);
            });
        };

        var processTask = function (task_id, _on_success, _on_failure, _max_attempts) {
            console.log("test");
            _max_attempts = typeof _max_attempts !== 'undefined' ? _max_attempts : 15;
            $http.get('/task/' + task_id + '/').then(function (response) {
                if (response.data.state === 'SUCCESS') {
                    console.log(response);
                    return _on_success(response.data.result);
                } else if (response.data.state === 'FAILURE') {
                    return _on_failure(response.data.result);
                } else {
                    // successful HTTP request, but message is not SUCCESS
                    // if it's not SUCCESS, just wait 2 seconds and try again
                    if (--_max_attempts) {
                        $timeout(processTask, 1000, true, task_id, _on_success, _on_failure, _max_attempts);
                    } else {
                        _on_failure('task expired: ' + task_id);
                    }
                }
            }, function (error) {
                console.log(error);
                return _on_failure(error);
            });
            //}).then(function (error) {
            //    // error while polling (401, 500, etc)
            //    return _on_failure(error);
            //});
        };
        return {
            processTask: processTask,
            processTaskv3: processTaskv3
        };
    }
]);


app.factory('TaskService2', [
    '$timeout',
    '$http',
    '$q',
    function ($timeout, $http, $q) {
        var processTask = function (task_id, max_attempts) {
            var max = typeof max_attempts !== 'undefined' ? max_attempts : 20;
            var initialMax = max;
            var deferred = $q.defer();

            // function that runs while decrementing max
            (function resolveTask() {
                $http.get('/task/' + task_id + '/').then(function (response) {
                    if (response.data.state === 'SUCCESS') {
                        console.log('Task ' + task_id + ' took ' + (initialMax - max) + ' tries.');
                        deferred.resolve(response.data.result);
                    } else if (response.data.state === 'FAILURE') {
                        console.log('Task ' + task_id + ' took ' + (initialMax - max) + ' tries. [failed]');
                        deferred.reject(response.data.result);
                    } else {
                        if (--max) {
                            $timeout(resolveTask, 500);
                        } else {
                            deferred.reject({detail: 'Task expired.'});
                        }
                    }
                }, function (error) {
                    deferred.reject(error);
                });
            })();

            return deferred.promise;
        };
        return {
            processTask: processTask
        };
    }
]);


app.factory('TaskService3', [
    '$timeout',
    '$http',
    '$q',
    function ($timeout, $http, $q) {
        var processTask = function (task_id, max_attempts, time_out) {
            // New parameter for timeout for task request
            var max = typeof max_attempts !== 'undefined' ? max_attempts : 20;
            var initialMax = max;
            var deferred = $q.defer();

            // function that runs while decrementing max
            (function resolveTask() {
                $http.get('/task/' + task_id + '/').then(function (response) {
                    if (response.data.state === 'SUCCESS') {
                        console.log('Task ' + task_id + ' took ' + (initialMax - max) + ' tries.');
                        deferred.resolve(response.data.result);
                    } else if (response.data.state === 'FAILURE') {
                        console.log('Task ' + task_id + ' took ' + (initialMax - max) + ' tries. [failed]');
                        deferred.reject(response.data.result);
                    } else {
                        if (--max) {
                            $timeout(resolveTask, time_out);
                        } else {
                            deferred.reject({detail: 'Task expired.'});
                        }
                    }
                }, function (error) {
                    deferred.reject(error);
                });
            })();

            return deferred.promise;
        };
        return {
            processTask: processTask
        };
    }
]);
