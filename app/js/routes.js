(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
            when('/', {
                templateUrl: 'views/corpus/corpus.html',
                controller: 'CorpusController'
            }).
            when('/WebEntity/:webEntityId', {
                templateUrl: 'views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
        }
    ]);

})();