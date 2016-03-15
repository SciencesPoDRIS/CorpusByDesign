(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider.
            when('/corpus/:corpusId/description', {
                templateUrl: 'app/views/description/description.html',
                controller: 'DescriptionController'
            }).
            when('/corpus/:corpusId', {
                templateUrl: 'app/views/main/main.html',
                controller: 'MainController'
            }).
            when('/corpus/:corpusId/webentity/:webEntityId', {
                templateUrl: 'app/views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                redirectTo: '/corpus/climatechanges'
            });
        }
    ]);

})();