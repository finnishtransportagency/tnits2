import { RoadFeatureProperties } from "./road_feature_properties";
import { SchemaReference, RoadFeatureId, updateInfo } from "./interfaces";
import { CodeListReference } from "./utils";
import { LocationReference } from "./location_reference";
import { Condition } from "./conditions";

export class RoadFeatureDataset {
    $: SchemaReference;
    metadata: { Metadata: { datasetId: string, datasetCreationTime: string } };
    type: string;
    roadFeatures: Array<RoadFeatures | null>;

    constructor(dataSetId: string, endTime: string, type: string) {
        this.$ = {
            'xmlns': "http://spec.tn-its.eu/schemas/",
            'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
            'xmlns:gml': "http://www.opengis.net/gml/3.2",
            'xmlns:xlink': "http://www.w3.org/1999/xlink",
            'xsi:schemaLocation': "http://spec.tn-its.eu/schemas/ http://spec.tn-its.eu/schemas/TNITS.xsd"
        };
        this.metadata = {
            Metadata: {
                datasetId: dataSetId,
                datasetCreationTime: new Date(endTime).toISOString()
            }
        };
        this.type = type;
        this.roadFeatures = [];
    }

    addRoadFeature(roadFeature: RoadFeatures | null) {
        this.roadFeatures.push(roadFeature);
    }
}

export class RoadFeatures {
    RoadFeature: RoadFeature;

    constructor (validFrom: string, updateInfo: string, source: CodeListReference,
                featureType: CodeListReference, properties: RoadFeatureProperties[], providerId: string, 
                id: number, openLR: LocationReference, geometry: LocationReference, conditions?: Condition) {
        this.RoadFeature = new RoadFeature(validFrom, updateInfo, source, featureType, properties, providerId, id, openLR, geometry, conditions);
    }
}

class RoadFeature {
    validFrom: string;
    beginLifespanVersion: string;
    updateInfo: updateInfo;
    source: CodeListReference;
    type: CodeListReference;
    properties: Array<RoadFeatureProperties>;
    id: RoadFeatureId;
    condition?: Condition;
    locationReference: Array<LocationReference>;

    constructor(validFrom: string, updateInfo: string, source: CodeListReference,
                featureType: CodeListReference, properties: RoadFeatureProperties[], providerId: string, 
                id: number, openLR: LocationReference, geometry: LocationReference, conditions?: Condition) {
        this.validFrom = validFrom.split('T')[0];
        this.beginLifespanVersion = validFrom;
        this.updateInfo = { UpdateInfo: { type: updateInfo }};
        this.source = source;
        this.type = featureType;
        this.properties = properties;
        this.id = { RoadFeatureId: { providerId: providerId, id: id } }
        if (conditions != null) this.condition = conditions;
        this.locationReference = [openLR, geometry];
    }
}
