import { AssetType } from "./asset_types";

export interface AssetTypeChanges {
    assetType: AssetType, 
    features: Array<Change>
}

/** Feature change interfaces */
export interface Feature {
    id: number;
    type: string;
}

export interface LinearFeature extends Feature {
    geometry: LinearGeometry;
    properties: LinearProperties;
}

export interface PointFeature extends Feature {
    geometry: PointGeometry;
    properties: PointProperties;
}

export interface ProhibitionFeature extends Feature {
    geometry: LinearGeometry;
    properties: ProhibitionProperties;
}

export type Change = LinearFeature | PointFeature | ProhibitionFeature;
export type LinearChange = LinearFeature | ProhibitionFeature;

export interface Geometry {
    type: string;
}

export interface LinearGeometry extends Geometry {
    coordinates: Array<number[]>;
}

export interface PointGeometry extends Geometry  {
    coordinates: Array<number>;
}

export interface Properties {
    changeType: string;
    createdAt: string;
    createdBy: string;
    link: Link;
    modifiedAt: string;
    modifiedBy: string; 
    sideCode: number;
}

export interface BasicLinearProperties extends Properties {
    endMeasure: number;
    startMeasure: number;
}

export interface LinearProperties extends BasicLinearProperties {
    value: number;
}

export interface PointProperties extends Properties {
    mValue: number;
    typeValue?: number;
}

export interface ProhibitionProperties extends BasicLinearProperties {
    value: Array<ProhibitionValue>;
}

export interface ProhibitionValue {
    typeId: number;
    exceptions: Array<number>;
    validityPeriod: Array<ValidityPeriod>;
}

export interface ValidityPeriod {
    startHour: number;
    endHour: number;
    startMinute: number;
    endMinute: number;
    days: number;
}

export interface TimePeriod {
	startTime: string;
	endTime: string;
	days: number[];
}

export interface LinkProperties {
    functionalClass: number;
    length: number;
    type: number;
}

export interface Link {
    geometry: LinearGeometry;
    id: number;
    properties: LinkProperties;
    type: string;
}

export interface RoadFeatureId {
    RoadFeatureId: {
        providerId: string;
        id: number;
    }
}

export interface SchemaReference {
    [ key: string ]: string
}

export interface updateInfo {
    UpdateInfo: {
        type: string;
    }
}
