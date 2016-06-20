(function() {
    'use strict';

    // The configuration is written as an Angular service
    angular.module('webcorpus.conf', [])
        // Google Analytics Id
        .constant('googleAnalyticsId', 'XX-XXXXXXXX-X')
        .constant('colors', [{
            label: 'pink',
            color: '#F6A5CB'
        }, {
            label: 'yellow',
            color: '#E6E174'
        }, {
            label: 'green',
            color: '#83E7CC'
        }, {
            label: 'orange',
            color: '#FBA995'
        }, {
            label: 'brown',
            color: '#CEA764'
        }, {
            label: 'purple',
            color: '#BEAFD7'
        }]);
})();