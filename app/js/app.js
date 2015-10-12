(function() {
    'use strict';

    var app = angular.module('webcorpus', [
        'ui.bootstrap',
        'ngRoute',
        'webcorpus.corpus'
    ]);

    app.config(['$routeProvider', function($routeProvider) {
      $routeProvider.otherwise({redirectTo: '/'});
    }]);

})();