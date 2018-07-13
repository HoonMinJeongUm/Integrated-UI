(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('EntitiesController', EntitiesController);

    EntitiesController.$inject = ['$scope', 'vitrageTopologySrv', '$interval', '$location', '$timeout','modalSrv','$window','vitrageActionSrv'];

    function EntitiesController($scope, vitrageTopologySrv, $interval, $location, $timeout,modalSrv,$window,vitrageActionSrv) {
        this.model = {selected: {}};

        var _this = this,
            loadTime = 5000,
            errorCount = 0,
            loadInterval,
            initialized = false,
            timeoutSubscriber,
            referenceUrl = {};


        $scope.$watch('automaticRefresh', function (newData, oldData) {
            if (newData !== undefined && newData != oldData) {
                horizon.cookies.put('entitiesAutomaticRefresh', newData);
                if (newData) {
                    nextLoad();
                }
            }
        });

        $scope.$watch('selectedHeat', function (newData, oldData) {
            if (newData !== undefined && newData != oldData) {
                if (timeoutSubscriber) {
                    console.log('Canceling heat stack timeout');
                    $timeout.cancel(timeoutSubscriber);
                }
                timeoutSubscriber = $timeout(loadData, 250);
            }
        });

        $scope.$watch('depthRange', function (newData, oldData) {
            if (newData !== undefined && newData != oldData) {
                if (timeoutSubscriber) {
                    console.log('Canceling depth timeout');
                    $timeout.cancel(timeoutSubscriber);
                }
                timeoutSubscriber = $timeout(loadData, 250);
            }
        });

        $scope.$on('graphItemClicked', function (event, data) {
            vitrageActionSrv.getSetting()
            .then(
                function success(result) {
                    referenceUrl = result.data[1];

                },
                function error(result) {
                    console.log('Reference URL Error:', result);
                });

            if(referenceUrl.hasOwnProperty(data.vitrage_type)){
                data.Vitrage_reference = referenceUrl[data.vitrage_type];
            }else{
                data.Vitrage_reference = 'No reference';
            }
            _this.selectedItem = data;
            event.stopPropagation();
            $scope.$digest();
        });

        $scope.$on('actionItemClicked', function (event, data) {
            var new_data = data;
            _this.actionItem = new_data;
            vitrageActionSrv.getSetting()
            .then(
                function success(result) {
                _this.actionList = result.data[0];
                console.log(" ACTIONLIST :::: ",_this.actionList);
                new_data.url = result.data[1];
                },
                function error(result) {
                    console.log('Error in Action Panel:', result);
                });
            event.stopPropagation();
            $scope.$digest();
        });

        $scope.$on('selectedAction', function (event,action){
            var modalOptions = {};
            console.log("CHECK ACTION",action);

            if(action[0] == 'Mistral'){
                 modalOptions = {
                     animation: false,
                     templateUrl: STATIC_URL + 'dashboard/project/components/actions/wait-spinner.html',
                     controller: 'WaitSpinnerModal',
                     backdrop: 'static',
                     windowClass: 'modalSize',
                     resolve: {action: function() {
                     return action;
                     }}
                 };
            }else{
                 modalOptions = {
                     animation: false,
                     templateUrl: STATIC_URL + 'dashboard/project/components/actions/actions.html',
                     controller: 'ActionListModal',
                     backdrop: 'static',
                     resolve: {action: function() {
                     return action;
                     }}
                 };
             }
            modalSrv.show(modalOptions);
        });

        $scope.$on('newTab', function (event,action_type) {
            if(action_type == 'Rally'){
                vitrageActionSrv.getDetailedActionlist([action_type,'Vitrage']);
                $window.open(STATIC_URL + 'dashboard/project/components/actions/vitrage.html');
            }else {
                $window.open(action_type);
            }
        });


        this.setSelected = function (item) {
            this.model.selected = item;
        };

        loadData();

        function loadData() {
            var url = $location.absUrl();
            var admin = false;
            if (url.indexOf('admin') != -1) admin = true;

            // get heat stacks
            if (!_this.initialized) {
                vitrageTopologySrv.getTopology('graph', null, admin)
                    .then(function (res) {
                        var heats = [];

                        _.each(res.data.nodes, function (node) {
                            if (node.vitrage_type === 'heat.stack') {
                                heats.push({name: node.name, vitrageId: node.vitrage_id});
                            }
                        });

                        $scope.heats = heats;
                        _this.initialized = true;
                    });
            }

            var config = {params: {query: '{"and": [{"==": {"vitrage_is_placeholder": false}}, {"==": {"vitrage_is_deleted": false}}]}'}};
            if ($scope.selectedHeat && $scope.selectedHeat !== 'all') {
                config.params.depth = $scope.depthRange;
                config.params.root = $scope.selectedHeat;
            }

            console.log('Config: ', config);

            vitrageTopologySrv.getTopology('graph', config, admin)
                .then(function (res) {
                    var nodes = res.data.nodes,
                        links = res.data.links;

                    _.each(links, function (link) {
                        link.source = nodes[link.source];
                        link.target = nodes[link.target];
                    });

                    if (_this.graphData) {
                        mergeData(res.data);
                    } else {
                        _this.graphData = res.data;
                        _this.graphData.ts = Date.now();
                    }

                    errorCount = 0;
                    nextLoad();
                })
                .catch(function (res) {
                    nextLoad(++errorCount * 2 * loadTime);
                });
        }

        function nextLoad(mill) {
            mill = mill || loadTime;
            cancelNextLoad();

            if ($scope.automaticRefresh) {
                loadInterval = $interval(loadData, mill);
            }

        }

        function cancelNextLoad() {
            $interval.cancel(loadInterval);
        }

        function dataChanged(nodes1, nodes2, links1, links2) {
            if (nodes1.length !== nodes2.length || links1.length !== links2.length) {
                console.log('number of nodes or links changed');
                return true;
            }

            // check for nodes change
            for (var i = 0; i < nodes1.length; i++) {
                var nodeFound = false;
                for (var j = 0; j < nodes2.length; j++) {
                    if (nodes1[i].name === nodes2[j].name) {
                        nodeFound = true;
                        continue;
                    }
                }
                if (!nodeFound) {
                    console.log('name of nodes changed');
                    return true;
                }
            }

            return false;
        }

        function mergeData(data) {
            var graphNodes = $scope.vm.graphData.nodes,
                graphLinks = $scope.vm.graphData.links;

            if (dataChanged(graphNodes, data.nodes, graphLinks, data.links)) {
                graphNodes.splice(0, graphNodes.length);
                graphLinks.splice(0, graphLinks.length);

                _.each(data.nodes, function (node) {
                    graphNodes.push(node);
                });

                _.each(data.links, function (link) {
                    graphLinks.push(link);
                });

                $scope.vm.graphData.ts = Date.now();

                /* temp stuff */
                d3.selectAll('.node .icon')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('transform', 'scale(1)')
                    .attr('class', function (d) {
                        var category = d.vitrage_category,
                            cls = '';
                        if (category && category.toLowerCase() === 'alarm') {
                            var severity = d.vitrage_operational_severity;
                            if (severity) {
                                switch (severity.toLowerCase()) {
                                    case 'critical':
                                        cls = 'red';
                                        break;
                                    case 'severe':
                                        cls = 'orange';
                                        break;
                                    case 'warning':
                                        cls = 'yellow';
                                        break;
                                    case 'ok':
                                        cls = 'green';
                                        break;
                                    case 'n/a':
                                        cls = 'gray';
                                        break;
                                    default: //'DISABLED', 'UNKNOWN', 'UNDEFINED'
                                        cls = 'gray';
                                        break;
                                }
                            }
                        } else {
                            var reald = _.find(graphNodes, function (n) {
                                return n.id == d.id;
                            });

                            if (reald) {
                                var state = reald.vitrage_operational_state;
                                if (state) {
                                    switch (state.toLowerCase()) {
                                        case 'error':
                                            cls = 'red';
                                            break;
                                        case 'suboptimal':
                                            cls = 'yellow';
                                            break;
                                        case 'n/a':
                                            cls = 'gray';
                                            break;
                                    }
                                }
                            }
                        }
                        return cls;
                    })
                    .style('font-size', function (d) {
                        var category = d.vitrage_category || 'no_category',
                            icon_size;

                        if (category && category.toLowerCase() === 'alarm') {
                            icon_size = '18px';
                        } else {
                            var type = d.vitrage_type || 'no_type';
                            switch (type.toLowerCase()) {
                                case 'nova.instance':
                                case 'nova.host':
                                case 'nova.zone':
                                case 'neutron.port':
                                    icon_size = '16px'; //fa-external-link-square
                                    break;
                                case 'openstack.cluster':
                                    icon_size = '18px'; //fa-cloud
                                    break;
                                case 'cinder.volume':
                                    icon_size = '22px';
                                    break;
                                case 'neutron.network':
                                default:
                                    icon_size = '20px';
                                    break;
                            }
                        }
                        return icon_size;
                    })
                    .style('stroke', function (d) {
                        var category = d.vitrage_category;
                        if (category && category.toLowerCase() === 'alarm') {
                            return '18px';
                        }
                        return '20px';
                    })
                    .classed('icon', true)
                    .classed('fill-only', function (d) {
                        var type = (d.vitrage_type || '').toLowerCase();
                        if (type && type === 'nova.host' || type === 'cinder.volume') {
                            return true;
                        }
                    })
                    .text(function (d) {
                        var category = d.vitrage_category,
                            icon;
                        if (category && category.toLowerCase() === 'alarm') {
                            icon = '\uf0f3'; //\uf0a2'; //bell-o
                        } else {
                            var type = d.vitrage_type || 'no_type';

                            switch (type.toLowerCase()) {
                                case 'nova.instance':
                                    icon = '\uf108'; //fa-desktop
                                    break;
                                case 'nova.host':
                                    icon = '\uf233'; //fa-server
                                    break;
                                case 'nova.scheduler':
                                    icon = '\uf0e4'; //fa-tachometer
                                    break;
                                case 'nova.zone':
                                    icon = '\uf279'; //fa-map
                                    break;
                                case 'neutron.network':
                                    icon = '\uf0ac'; //fa-globe
                                    break;
                                case 'neutron.port':
                                    icon = '\uf14c'; //fa-external-link-square
                                    break;
                                case 'cinder.volume':
                                    icon = '\uf0a0'; //fa-hdd-o
                                    break;
                                case 'openstack.cluster':
                                    icon = '\uf0c2'; //fa-cloud
                                    break;
                                case 'heat.stack':
                                    icon = '\uf1b3'; //fa-cubes
                                    break;
                                default:
                                    console.warn('Vitrage type not supported: ' + d.vitrage_type);
                                    icon = '\uf013'; //fa-cog
                                    break;
                            }
                        }
                        return icon;
                    });
            }

            // we need to updated the selected info
            if (_this.selectedItem && _this.selectedItem.vitrage_id && _this.selectedItem.vitrage_id !== '') {
                for (var i = 0; i < data.nodes.length; i++) {
                    var val = data.nodes[i];
                    if (val && val.vitrage_id && val.vitrage_id == _this.selectedItem.vitrage_id) {
                        if(referenceUrl.hasOwnProperty(val.vitrage_type)){
                            val.Vitrage_reference = referenceUrl[val.vitrage_type];
                        }else{
                            val.Vitrage_reference = 'No reference';
                        }
                        _this.selectedItem = val;
                        break;
                    }
                }
            }
        }

        /* utils */
        function rnd(min, max) {
            return Math.round(Math.random() * (max - min)) + min;
        }

        function onlyIn(a1, a2, prop) {
            prop = prop || 'id';
            return a1.filter(function (o1) {
                return a2.filter(function (o2) {
                    return o1[prop] === o2[prop];
                }).length === 0;
            })
        }
    }

})();
