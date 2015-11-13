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