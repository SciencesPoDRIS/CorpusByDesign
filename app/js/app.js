(function() {
    'use strict';

    /* Load modules */
    var app = angular.module('webcorpus', [
        'webcorpus.conf',
        'webcorpus.main',
        'webcorpus.directives',
        'webcorpus.filters',
        'webcorpus.routes',
        'webcorpus.services',
        'webcorpus.webentity',
        'webcorpus.description',
        'ngMaterial',
        'ui.bootstrap'
    ]);

    app.controller('mapController', ['$scope', '$window',
        function($scope, $window) {
            var m_width = $("#map").width(),
                width = 965,
                height = 585,
                country,
                state;

            var projection = d3.geo.equirectangular()
                .center([-75, -35])
                .scale(300)
                .translate([width / 2, height / 1.5]);

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select("#map").append("svg")
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("viewBox", "0 0 " + width + " " + height);

            svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height)
                .on("click", $scope.country_clicked);

            var g = svg.append("g");

            d3.json("../data/latinamerica.topo.json", function(error, us) {
                g.append("g")
                    .attr("id", "countries")
                    .selectAll("path")
                    .data(topojson.feature(us, us.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("id", function(d) {
                        return d.id;
                    })
                    .attr("d", path)
                    .on("click", $scope.country_clicked);
            });

            $scope.zoom = function(xyz) {
                g.transition()
                    .duration(750)
                    .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
                    .selectAll(["#countries"])
                    .style("stroke-width", 1.0 / xyz[2] + "px")
                    .selectAll(".city")
                    .attr("d", path.pointRadius(20.0 / xyz[2]));
            }

            $scope.get_xyz = function(d) {
                var bounds = path.bounds(d);
                var w_scale = (bounds[1][0] - bounds[0][0]) / width;
                var h_scale = (bounds[1][1] - bounds[0][1]) / height;
                var z = .96 / Math.max(w_scale, h_scale);
                var x = (bounds[1][0] + bounds[0][0]) / 2;
                var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
                return [x, y, z];
            }

            $scope.country_clicked = function(country) {
                // Unselect all area checkboxes but the one of the area clicked
                $.each($scope.categories.area.values, function(index, item) {
                    if(item.id != country.id) {
                        item.isSelected = false;
                    }
                    
                });
                $scope.filter2();
            }

            $(window).resize(function() {
                var w = $("#map").width();
                var h = $('#map').height();
                svg.attr("width", w);
                svg.attr("height", h);
            });
        }
    ]);

    /* Google analytics configuration */
    app.run(function(googleAnalyticsId, $rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function() {
            ga('create', googleAnalyticsId, 'auto');
            ga('send', 'pageview', { 'page': $location.path() });
        });
    });
})();