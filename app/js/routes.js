(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider.
            when('/', {
                templateUrl: 'views/corpus/corpus.html',
                controller: 'CorpusController'
            }).
            when('/description', {
                templateUrl: 'views/description/description.html',
                controller: 'DescriptionController'
            }).
            when('/webentity/:webEntityId', {
                templateUrl: 'views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
        }
    ]);

})();