(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider.
            when('/', {
                templateUrl: 'app/views/tiles/tiles.html',
                controller: 'TilesController'
            }).
            when('/description', {
                templateUrl: 'app/views/description/description.html',
                controller: 'DescriptionController'
            }).
            when('/webentity/:webEntityId', {
                templateUrl: 'app/views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
        }
    ]);

})();