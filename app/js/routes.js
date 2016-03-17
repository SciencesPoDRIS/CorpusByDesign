(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider.
            when('/:lang/:corpusId', {
                templateUrl: 'app/views/main/main.html',
                controller: 'MainController'
            }).
            when('/:lang/:corpusId/methodology', {
                templateUrl: 'app/views/methodology/methodology.html',
                controller: 'MethodologyController'
            }).
            when('/:lang/:corpusId/:webEntityId', {
                templateUrl: 'app/views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                redirectTo: '/fr/ameriquelatine'
            });
        }
    ]);

})();