(function() {
    'use strict';

    /* Load modules */
    var app = angular.module('webcorpus', [
        'webcorpus.conf',
        'webcorpus.corpus',
        'webcorpus.directives',
        'webcorpus.filters',
        'webcorpus.routes',
        'webcorpus.services',
        'webcorpus.webentity',
        'webcorpus.description',
        'ngMaterial',
        'ui.bootstrap'
    ]);

    /* Google analytics configuration */
    app.run(function(googleAnalyticsId, $rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function() {
            ga('create', googleAnalyticsId, 'auto');
            ga('send', 'pageview', {'page': $location.path()});
        });
    });

})();