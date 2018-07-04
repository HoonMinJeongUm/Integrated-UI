(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('vitrageActionSrv', VitrageActionSrv);

    VitrageActionSrv.$inject = ['$injector'];

    function VitrageActionSrv($injector) {
        var vitrageAPI;

        if ($injector.has('horizon.app.core.openstack-service-api.vitrage')) {
            vitrageAPI = $injector.get('horizon.app.core.openstack-service-api.vitrage');
        }

        function getDetailedActionlist(action_type) {
            if (vitrageAPI) {

                return vitrageAPI.getDetailedActionlist(action_type[0],action_type[1])
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (err) {
                            console.error(err);
                        }
                    );
            }
        }
        function postAction(action,requestDict) {
            if (vitrageAPI) {
                return vitrageAPI.postAction(action, requestDict)
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (err) {
                            console.error(err);
                        }
                    );
            }
        }
         function getSetting() {
            if (vitrageAPI) {
                return vitrageAPI.getSetting()
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (err) {
                            console.error(err);
                        }
                    );
            }
        }

        return {
            getDetailedActionlist: getDetailedActionlist,
            postAction: postAction,
            getSetting: getSetting
        };

    }
})();
