/*

(function($scope, $element) {
    'use strict';

    // Init scope variables
    $scope.filtersLabel = 'More filters';

    // Expand filters
    $scope.moreFilters = function() {
        $scope.isCollapsed = !$scope.isCollapsed;
        if (!$scope.isCollapsed) {
            $('.content .filters').height(($(window).height() - 127) + 'px');
            $scope.filtersLabel = 'Less filters';
        } else {
            $('.content .filters').height('200px');
            $scope.filtersLabel = 'More filters';
        }
    }

});

*/