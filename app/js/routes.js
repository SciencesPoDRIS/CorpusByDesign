(function() {
    'use strict';

    /* Routes */

    var app = angular.module('webcorpus.routes', ['ngRoute']);

    app.config(['$routeProvider', '$locationProvider', 
        function($routeProvider, $locationProvider) {
            // $locationProvider.html5Mode({
            //     enabled: true,
            //     requireBase: false
            // });

            $routeProvider.
            // Welcome page
            when('/:lang', {
                templateUrl: 'views/welcome/welcome.html',
                controller: 'WelcomeController'
            }).
            // Corpus page
            when('/:lang/:corpusId', {
                templateUrl: 'views/corpus/corpus.html',
                controller: 'CorpusController'
            }).
            // Methodoloy page of a corpus
            when('/:lang/:corpusId/methodology', {
                templateUrl: 'views/methodology/methodology.html',
                controller: 'MethodologyController'
            }).
            // Web entity description page of a corpus
            when('/:lang/:corpusId/:webEntityId', {
                templateUrl: 'views/webentity/webentity.html',
                controller: 'WebEntityCtrl'
            }).
            when('/:lang/:corpusId/map/:webEntityId', {
                templateUrl: 'views/webentity/webentity_map.html',
                controller: 'WebEntityCtrl'
            }).
            // Set default page as the welcome page in english
            otherwise({
                redirectTo: '/en'
            });
        }
    ]);

})();