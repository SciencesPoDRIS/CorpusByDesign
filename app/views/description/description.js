(function() {
    'use strict';

    var app = angular.module('webcorpus.description', []);

    app.controller('DescriptionController', ['$scope', '$sce', 'loadCorpora',
        function($scope, $sce, loadCorpora) {

            // Load all the corpora descriptions
            loadCorpora.getCorpora().then(function(data) {
                $scope.corpora = data[0];
                $scope.purpose = $sce.trustAsHtml(data[0].purpose);
                $scope.selection = $sce.trustAsHtml(data[0].selection);
                $scope.indexing = $sce.trustAsHtml(data[0].indexing);
                $scope.footnote = $sce.trustAsHtml(data[0].footnote);
                $scope.update = $sce.trustAsHtml(data[0].update);
                $scope.authors = $sce.trustAsHtml(data[0].authors);
                $scope.size = $sce.trustAsHtml(data[0].size);
            });
        }
    ]);

})();