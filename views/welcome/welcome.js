(function() {
    'use strict';

    var app = angular.module('webcorpus.welcome', []);

    app.controller('WelcomeController', ['$scope', 'loadCorpus', '$routeParams',
        function($scope, loadCorpus, $routeParams) {

            // Load the corpus configurations
            loadCorpus.getCorpora().then(function(corpora) {
                $scope.corpora = corpora;
                // Init routing variables
                $scope.lang = $routeParams.lang;
            });
        }
    ]);

})();