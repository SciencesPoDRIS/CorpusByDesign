(function() {
    'use strict';

    var app = angular.module('webcorpus.welcome', []);

    app.controller('WelcomeController', ['$scope', 'loadCorpora', '$routeParams',
        function($scope, loadCorpora, $routeParams) {

            // Load the corpus configurations
            loadCorpora.getCorpora().then(function(data) {
                $scope.corpora = data;
                // Init routing variables
                $scope.lang = $routeParams.lang;
            });
        }
    ]);

})();