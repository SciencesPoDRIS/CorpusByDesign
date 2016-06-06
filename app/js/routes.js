(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider.
            when('/:lang/:corpusId', {
                templateUrl: 'app/views/corpus/corpus.html',
                controller: 'CorpusController'
            }).
            when('/:lang/:corpusId/methodology', {
                templateUrl: 'app/views/methodology/methodology.html',
                controller: 'MethodologyController'
            }).
            when('/:lang/:corpusId/:webEntityId', {
                templateUrl: 'app/views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            when('/:lang/:corpusId/map/:webEntityId', {
                templateUrl: 'app/views/webentity/webentity_map.html',
                controller: 'WebEntityCtrl'
            }).
            otherwise({
                templateUrl: 'app/views/welcome/welcome.html',
                controller: 'WelcomeController'
            });
        }
    ]);

})();