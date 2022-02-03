const assert = require('chai').assert;
const PointTnItsConverter = require('../../dist/conversion/tn-its/point_asset_converter').PointTnItsConverter;

describe('Converter: Point asset converter', function() {
    
    const converter = new PointTnItsConverter();

    const change1 = {"type":"Feature","id":36375279,"geometry":{"type":"Point","coordinates":[497164.2046944863,6702962.387359183,6.434807297431907]},"properties":{"modifiedAt":"18.05.2019 18:32:35","changeType":"Modify","sideCode":1,"link":{"type":"Feature","id":1993486,"geometry":{"type":"LineString","coordinates":[[497234.074,6702879.574,2.6019999999989523],[497161.722,6702965.33,6.570999999996275]]},"properties":{"functionalClass":5,"type":3,"length":112.20028270913981}},"createdAt":"27.11.2015 14:37:09","createdBy":"test","mValue":108.418,"modifiedBy":"vvh_generated"}};
    const change2 = {"type":"Feature","id":80871068,"geometry":{"type":"Point","coordinates":[365863.72288769705,6682596.497289005,47.13843275962406]},"properties":{"modifiedAt":"15.01.2022 00:52:42","typeValue":36,"changeType":"Modify","sideCode":3,"link":{"type":"Feature","id":150651,"geometry":{"type":"LineString","coordinates":[[365746.525,6682482.235,55.39800000000105],[365756.597,6682480.712,54.74300000000221],[365766.056,6682483.754,54.00699999999779],[365785.228,6682502.631,52.31900000000314],[365804.273,6682526.55,50.929000000003725],[365825.016,6682551.657,49.97400000000198],[365842.845,6682573.861,49.00100000000384],[365851.994,6682585.963,48.20600000000559],[365861.831,6682595.466,47.28599999999278],[365870.831,6682600.372,46.58400000000256],[365881.036,6682602.404,46.05899999999383]]},"properties":{"functionalClass":4,"type":3,"length":188.15088453225326}},"createdAt":"10.01.2020 00:24:57","createdBy":"test","mValue":169.655,"modifiedBy":"vvh_generated"}};

    // Dummy asset types
    const assetType1 = {id: "pedestrian_crossing"};
    const assetType2 = {id: "warning_signs_group"};

    it('Split road features', function() {
        const roadFeatures1 = converter.splitFeaturesApplicableToBothDirections([change1]);

        assert.lengthOf(roadFeatures1, 1);
    });

    it('OpenLR encoding should match', function() {
        const openLr1 = converter.encodeOpenLRLocationString(change1);
        const openLr2 = converter.encodeOpenLRLocationString(change2);

        assert.equal(openLr1, 'CxMqDCr+zCOcAf98AE0jbPYG');
        assert.equal(openLr2, 'CxF5iirZbBtnAwDrAHAbduYY');
    });

    it('Coordinate transform to WSG84 should match', function() {
        const transformedGeometry1 = converter.geometry(change1);
        const transformedGeometry2 = converter.geometry(change2);

        assert.equal(transformedGeometry1, '26.948436982041535 60.462865465256');
        assert.equal(transformedGeometry2, '24.575906799459364 60.257888415450225');
    });

    it('Conditions', function() { 
        const conditions1 = converter.conditions(assetType1, change1, new Date().toISOString());

        assert.typeOf(conditions1, 'undefined', "Asset type has no conditions");
    });

    it('Properties', function() {
        const properties1 = converter.properties(assetType1, change1);
        const properties2 = converter.properties(assetType2, change2);

        assert.lengthOf(properties1, 0, "Asset type has no properties");
        assert.lengthOf(properties2, 1, "Asset type has properties");
    });

});