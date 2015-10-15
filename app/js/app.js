(function() {
    'use strict';

    /* Load modules */
    var app = angular.module('webcorpus', [
        'ngRoute',
        'ngMaterial',
        'ui.bootstrap',
        'webcorpus.conf',
        'webcorpus.directives',
        'webcorpus.filters',
        'webcorpus.services',
        'webcorpus.corpus'
    ]);

    /* Routing configuration */
    app.config(['$routeProvider', function($routeProvider) {
      $routeProvider.otherwise({redirectTo: '/'});
    }]);

    /* Google analytics configuration */
    app.run(function(googleAnalyticsId, $rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function() {
            ga('create', googleAnalyticsId, 'auto');
            ga('send', 'pageview', {'page': $location.path()});
        });
    });

})();