const assert = require('chai').assert;
const validator = require('../../dist/dataset-validation/validator/xml_validator');
const nodeAssert = require('assert');

describe('Validator: Validate dataset', function() {
    const valid_dataset1 = '<RoadFeatureDataset xmlns="http://spec.tn-its.eu/schemas/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://spec.tn-its.eu/schemas/ http://spec.tn-its.eu/schemas/TNITS.xsd"><metadata><Metadata><datasetId>test</datasetId><datasetCreationTime>2022-01-01T00:00:00.000Z</datasetCreationTime></Metadata></metadata><type>Update</type><roadFeatures/></RoadFeatureDataset>';
    const valid_dataset2 = '<RoadFeatureDataset xmlns="http://spec.tn-its.eu/schemas/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://spec.tn-its.eu/schemas/ http://spec.tn-its.eu/schemas/TNITS.xsd"><metadata><Metadata><datasetId>test</datasetId><datasetCreationTime>2022-01-01T00:00:00.000Z</datasetCreationTime></Metadata></metadata><type>Update</type><roadFeatures><RoadFeature><validFrom>2022-01-01</validFrom><beginLifespanVersion>2022-01-01T00:00:00.000Z</beginLifespanVersion><updateInfo><UpdateInfo><type>Add</type></UpdateInfo></updateInfo><source xlink:href="http://spec.tn-its.eu/codelists/RoadFeatureSourceCode#regulation" xlink:title="regulation"/><type xlink:href="http://spec.tn-its.eu/codelists/RoadFeatureTypeCode#speedLimit" xlink:title="speedLimit"/><properties><GenericRoadFeatureProperty><type xlink:href="http://spec.tn-its.eu/codelists/RoadFeaturePropertyTypeCode#maximumSpeedLimit" xlink:title="maximumSpeedLimit"/><value>30</value><valueReference xlink:href="http://spec.tn-its.eu/codelists/UOMIdentifierCode#kph" xlink:title="kph"/></GenericRoadFeatureProperty></properties><id><RoadFeatureId><providerId>FI.LiVi.OTH</providerId><id>68715744</id></RoadFeatureId></id><locationReference><OpenLRLocationReference><binaryLocationReference><BinaryLocationReference><base64String>CxGQ1SxUmiuiBQD/AQ0rEQ==</base64String><openLRBinaryVersion xlink:href="http://spec.tn-its.eu/codelists/OpenLRBinaryVersionCode#v2_4" xlink:title="v2_4"/></BinaryLocationReference></binaryLocationReference></OpenLRLocationReference></locationReference><locationReference><GeometryLocationReference><encodedGeometry><gml:LineString gml:id="ID-FOO1" srsDimension="2" srsName="EPSG:4326"><gml:posList>24.70182344993451 62.33972732583103 24.70224646018838 62.34017533541493 24.70289796583275 62.340842966934844 24.7034588080214 62.341403858495205 24.70373790892014 62.34170901758705 24.704146273470773 62.34214919049838 24.704377357026267 62.34241445435835</gml:posList></gml:LineString></encodedGeometry></GeometryLocationReference></locationReference></RoadFeature></roadFeatures><roadFeatures><RoadFeature><validFrom>2022-01-01</validFrom><beginLifespanVersion>2022-01-01T00:00:00.000Z</beginLifespanVersion><updateInfo><UpdateInfo><type>Add</type></UpdateInfo></updateInfo><source xlink:href="http://spec.tn-its.eu/codelists/RoadFeatureSourceCode#regulation" xlink:title="regulation"/><type xlink:href="http://spec.tn-its.eu/codelists/RoadFeatureTypeCode#speedLimit" xlink:title="speedLimit"/><properties><GenericRoadFeatureProperty><type xlink:href="http://spec.tn-its.eu/codelists/RoadFeaturePropertyTypeCode#maximumSpeedLimit" xlink:title="maximumSpeedLimit"/><value>30</value><valueReference xlink:href="http://spec.tn-its.eu/codelists/UOMIdentifierCode#kph" xlink:title="kph"/></GenericRoadFeatureProperty></properties><id><RoadFeatureId><providerId>FI.LiVi.OTH</providerId><id>68715744</id></RoadFeatureId></id><locationReference><OpenLRLocationReference><binaryLocationReference><BinaryLocationReference><base64String>CxGRTCxVGCuxBf8B/vMrAg==</base64String><openLRBinaryVersion xlink:href="http://spec.tn-its.eu/codelists/OpenLRBinaryVersionCode#v2_4" xlink:title="v2_4"/></BinaryLocationReference></binaryLocationReference></OpenLRLocationReference></locationReference><locationReference><GeometryLocationReference><encodedGeometry><gml:LineString gml:id="ID-FOO2" srsDimension="2" srsName="EPSG:4326"><gml:posList>24.70182344993451 62.33972732583103 24.70224646018838 62.34017533541493 24.70289796583275 62.340842966934844 24.7034588080214 62.341403858495205 24.70373790892014 62.34170901758705 24.704146273470773 62.34214919049838 24.704377357026267 62.34241445435835</gml:posList></gml:LineString></encodedGeometry></GeometryLocationReference></locationReference></RoadFeature></roadFeatures></RoadFeatureDataset>';
    const invalid_dataset1 = '<RoadFeatureDataset xmlns="http://spec.tn-its.eu/schemas/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://spec.tn-its.eu/schemas/ http://spec.tn-its.eu/schemas/TNITS.xsd"><metadata><Metadata><datasetId>test</datasetId><datasetCreationTime>2022-01-01T00:00:00.000Z</datasetCreationTime></Metadata></metadata><type>Update<roadFeatures/></RoadFeatureDataset>';
    const invalid_dataset2 = '<RoadFeatureDataset xmlns="http://spec.tn-its.eu/schemas/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://spec.tn-its.eu/schemas/ http://spec.tn-its.eu/schemas/TNITS.xsd"><metadata><Metadata><datasetId>test</datasetId><datasetCreationTime>2022-01-01T00:00:00.000Z</datasetCreationTime></Metadata></metadata><type>Update</type></RoadFeatureDataset>';

    it('Validate empty dataset', async function() {
        const validate1 = await validator.validate(valid_dataset1, "test");

        assert.typeOf(validate1, 'boolean');
        assert.equal(validate1, true);
    });

    it('Validate data set with changes', async function() {
        const validate2 = await validator.validate(valid_dataset2, "test");

        assert.typeOf(validate2, 'boolean');
        assert.equal(validate2, true);
    })

    it('Validation fails with invalid xml', async function() {
        await nodeAssert.rejects(
            async () => {
                await validator.validate(invalid_dataset1, "test");
            },
            /Premature end of data in tag RoadFeatureDataset line 1/
        );
    });

    it('Validation fails with schema error', async function() {
        await nodeAssert.rejects(
            async () => {
                await validator.validate(invalid_dataset2, "test");
            },
            /Missing child element\(s\)/
        );
    });

});