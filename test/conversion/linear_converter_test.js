const assert = require('chai').assert;
const linearConverter = require('../../dist/conversion/tn-its/linear_asset_converter');

describe('Converter: Linear asset converter', function() {

    const converter = new linearConverter.LinearTnItsConverter();

    // speed limit (applicable both directions)
    const change1 = {"type":"Feature","id":68715744,"geometry":{"type":"LineString","coordinates":[[380988.385,6914141.499,132.68300000000454],[381012.057,6914190.609,130.71300000000338],[381048.426,6914263.755,129.7320000000036],[381079.678,6914325.182,129.69100000000617],[381095.333,6914358.65,129.84500000000116],[381118.213,6914406.915,130.1429999999964],[381131.2239424657,6914436.028871259,130.61199792608735]]},"properties":{"startMeasure":0.0,"changeType":"Add","sideCode":1,"link":{"type":"Feature","id":11072482,"geometry":{"type":"LineString","coordinates":[[380988.385,6914141.499,132.68300000000454],[381012.057,6914190.609,130.71300000000338],[381048.426,6914263.755,129.7320000000036],[381079.678,6914325.182,129.69100000000617],[381095.333,6914358.65,129.84500000000116],[381118.213,6914406.915,130.1429999999964],[381131.224,6914436.029,130.6119999999937]]},"properties":{"functionalClass":6,"type":3,"length":327.3771410125601}},"createdAt":"13.04.2021 16:19:00","createdBy":"test","endMeasure":327.377,"value":30}};
    const change2 = {"type":"Feature","id":68715744,"geometry":{"type":"LineString","coordinates":[[380988.385,6914141.499,132.68300000000454],[381012.057,6914190.609,130.71300000000338],[381048.426,6914263.755,129.7320000000036],[381079.678,6914325.182,129.69100000000617],[381095.333,6914358.65,129.84500000000116],[381118.213,6914406.915,130.1429999999964],[381131.2239424657,6914436.028871259,130.61199792608735]]},"properties":{"startMeasure":0.0,"changeType":"Add","sideCode":3,"link":{"type":"Feature","id":11072482,"geometry":{"type":"LineString","coordinates":[[380988.385,6914141.499,132.68300000000454],[381012.057,6914190.609,130.71300000000338],[381048.426,6914263.755,129.7320000000036],[381079.678,6914325.182,129.69100000000617],[381095.333,6914358.65,129.84500000000116],[381118.213,6914406.915,130.1429999999964],[381131.224,6914436.029,130.6119999999937]]},"properties":{"functionalClass":6,"type":3,"length":327.3771410125601}},"createdAt":"13.04.2021 16:19:00","createdBy":"test","endMeasure":327.377,"value":30}};
    const change3 = {"type":"Feature","id":19518759,"geometry":{"type":"LineString","coordinates":[[642052.7582236576,6944410.654797484,80.28025687036987],[642061.0577615625,6944431.353911327,80.48896885649165]]},"properties":{"startMeasure":109.956,"changeType":"Add","sideCode":2,"link":{"type":"Feature","id":999571,"geometry":{"type":"LineString","coordinates":[[642013.1,6944308.109,79.07600000000093],[642020.076,6944326.74,79.3469999999943],[642034.774,6944365.802,79.82799999999406],[642061.059,6944431.357,80.4890000000014]]},"properties":{"functionalClass":3,"type":3,"length":132.25823481878638}},"createdAt":"02.09.2016 12:40:37","createdBy":"test","endMeasure":132.258,"modifiedBy":"NULL","value":30}};
    const change4 = {"type":"Feature","id":19518759,"geometry":{"type":"LineString","coordinates":[[642052.7582236576,6944410.654797484,80.28025687036987],[642061.0577615625,6944431.353911327,80.48896885649165]]},"properties":{"startMeasure":109.956,"changeType":"Add","sideCode":3,"link":{"type":"Feature","id":999571,"geometry":{"type":"LineString","coordinates":[[642013.1,6944308.109,79.07600000000093],[642020.076,6944326.74,79.3469999999943],[642034.774,6944365.802,79.82799999999406],[642061.059,6944431.357,80.4890000000014]]},"properties":{"functionalClass":3,"type":3,"length":132.25823481878638}},"createdAt":"02.09.2016 12:40:37","createdBy":"test","endMeasure":132.258,"modifiedBy":"NULL","value":30}};
    const change5 = {"type":"Feature","geometry": {"coordinates": [[373809.235,6677797.194,0.0],[373857.037,6677822.138,0.0],[373861.411,6677824.325,0.0],[373881.506,6677834.77,0.0],[373903.676,6677845.834,0.0],[373913.223,6677851.591,0.0],[373917.927,6677859.733,0.0],[373918.6579676908,6677868.98559103,0.0]],"type": "LineString"},"id": 200277,"properties": {"changeType": "Modify","createdAt": "11.04.2016 15:44:09","endMeasure": 136.067,"link": {"geometry": {"coordinates": [[373809.235,6677797.194,0.0],[373857.037,6677822.138,0.0],[373861.411,6677824.325,0.0],[373881.506,6677834.77,0.0],[373903.676,6677845.834,0.0],[373913.223,6677851.591,0.0],[373917.927,6677859.733,0.0],[373918.658,6677868.986,0.0]],"type": "LineString"},"id": 1611289,"properties": {"functionalClass": 4,"length": 136.06741024424275,"type": 3},"type": "Feature"},"modifiedAt": "11.05.2016 14:47:56","modifiedBy":"test2","sideCode": 1,"startMeasure":0.0,"value":120}};
    const change6 = {"type":"Feature","id":80682601,"geometry":{"type":"LineString","coordinates":[[620867.319,6810735.08,97.51200000000244],[620866.58,6810737.461,97.49499999999534],[620862.809,6810755.324,96.903999999995],[620858.919,6810780.068,94.75100000000384],[620842.697,6810826.042,93.34500000000116],[620832.051,6810850.275,93.528999999995],[620824.656,6810863.301,93.53900000000431],[620819.261,6810871.507,93.28900000000431],[620806.139,6810888.95,92.72699999999895],[620790.857,6810906.594,92.70500000000175],[620790.001,6810908.33,92.73099999999977]]},"properties":{"startMeasure":0.0,"changeType":"Add","sideCode":1,"link":{"type":"Feature","id":12495560,"geometry":{"type":"LineString","coordinates":[[620867.319,6810735.08,97.51200000000244],[620866.58,6810737.461,97.49499999999534],[620862.809,6810755.324,96.903999999995],[620858.919,6810780.068,94.75100000000384],[620842.697,6810826.042,93.34500000000116],[620832.051,6810850.275,93.528999999995],[620824.656,6810863.301,93.53900000000431],[620819.261,6810871.507,93.28900000000431],[620806.139,6810888.95,92.72699999999895],[620790.857,6810906.594,92.70500000000175],[620790.001,6810908.33,92.73099999999977]]},"properties":{"functionalClass":6,"type":3,"length":192.92266803612065}},"createdAt":"04.12.2021 06:50:23","createdBy":"test","endMeasure":192.923,"value":30000}};
    // Vehicle prohibition
    const change7 = {"type":"Feature","id":10567145,"geometry":{"type":"LineString","coordinates":[[301157.595,6654007.662,11.27499999999418],[301184.716,6654043.424,13.297000000005937]]},"properties":{"modifiedAt":"25.02.2016 10:56:06","startMeasure":0.0,"changeType":"Remove","sideCode":2,"link":{"type":"Feature","id":4772544,"geometry":{"type":"LineString","coordinates":[[301157.595,6654007.662,11.27499999999418],[301184.716,6654043.424,13.297000000005937]]},"properties":{"functionalClass":8,"type":9,"length":44.88283953817744}},"createdAt":"12.11.2015 09:34:37","createdBy":"test","endMeasure":44.883,"modifiedBy":"k225541","value":[{"typeId":2,"exceptions":[21],"validityPeriod":[{"startMinute":0,"endHour":11,"startHour":6,"endMinute":0,"days":1}]}]}};

    // Dummy asset types
    const assetType1 = {id: "speed_limits"};
    const assetType6 = {id: "trailer_truck_weight_limits"};
    const assetType7 = {id: "vehicle_prohibitions"};

    it('Split road features', function() {
        const roadFeatures1 = converter.splitFeaturesApplicableToBothDirections([change1]);
        const roadFeatures2 = converter.splitFeaturesApplicableToBothDirections([change2]);

        assert.lengthOf(roadFeatures1, 2, 'Asset is applicable to both direction');
        assert.equal(roadFeatures1[0].properties.sideCode, 2);
        assert.equal(roadFeatures1[1].properties.sideCode, 3);
        assert.lengthOf(roadFeatures2, 1, 'Asset is applicable to one direction');
        assert.equal(roadFeatures2[0], change2);
    });

    it('OpenLR encoding', function() {
        const openLr2 = converter.encodeOpenLRLocationString(change2);
        const openLr3 = converter.encodeOpenLRLocationString(change3);
        const openLr4 = converter.encodeOpenLRLocationString(change4);
        const openLr5 = converter.encodeOpenLRLocationString(change5);

        assert.equal(openLr2, 'CxGRTCxVGCuxBf8B/vMrAg==');
        assert.equal(openLr3, 'CxUq3iyEYBNCAgBoAG0TUtM=');
        assert.equal(openLr4, 'CxUrDiyEkxNSAv+Y/5MTItM=');
        assert.equal(openLr5, 'CxGUkirSPhtlAgDBAEQbEQ==');
    });

    it('Coordinate transform to WSG84', function() {
        const transformedCoordinates2 = converter.geometry(change2);
        const transformedCoordinates5 = converter.geometry(change5);

        assert.equal(transformedCoordinates2, '24.70182344993451 62.33972732583103 24.70224646018838 62.34017533541493 24.70289796583275 62.340842966934844 24.7034588080214 62.341403858495205 24.70373790892014 62.34170901758705 24.704146273470773 62.34214919049838 24.704377357026267 62.34241445435835')
        assert.equal(transformedCoordinates5, '24.72235191146094 60.21737240581955 24.723198383553324 60.217611002151656 24.723275897824788 60.21763197778406 24.723631767324697 60.21773190963187 24.724024672123548 60.21783803631094 24.724193250959672 60.21789264194462 24.72427301354365 60.21796714666564 24.724280440167675 60.218050385998446');
    });

    it('Conditions', function() { 
        const conditions1 = converter.conditions(assetType1, change1, new Date().toISOString());
        const conditions6 = converter.conditions(assetType6, change6, new Date().toISOString());
        const conditions7 = converter.conditions(assetType7, change7, new Date().toISOString());

        assert.typeOf(conditions1, 'undefined', "Asset type has no conditions");
        assert.typeOf(conditions6, 'Object', "Asset type has conditions");
        assert.typeOf(conditions7, 'Object', "Asset type has conditions");
    });

    it('Properties', function() {
        const properties1 = converter.properties(assetType1, change1);
        const properties6 = converter.properties(assetType6, change6);
        const properties7 = converter.properties(assetType7, change7);

        assert.lengthOf(properties1, 1, "Asset type has properties");
        assert.lengthOf(properties6, 1, "Asset type has properties");
        assert.lengthOf(properties7, 0, "Asset type has no properties");
    });

});
