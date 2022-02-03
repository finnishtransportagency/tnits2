import { AssetConverter } from "../asset_converter";
import { LinearTnItsConverter } from "../linear_asset_converter";
import { PointTnItsConverter } from "../point_asset_converter";

export class AssetType {
    id: string;
    featureType: string;
    propertyType: string;
    unit: string;
    provider: Provider;
    service: AssetConverter;
    source: string;

    constructor(id: string, featureType: string, propertyType: string, unit: string, 
        provider: Provider, service: AssetConverter, source = "regulation") {
        this.id = id;
        this.featureType = featureType;
        this.propertyType = propertyType;
        this.unit = unit;
        this.provider = provider;
        this.service = service;
        this.source = source;
    }
}

class Provider {
    name: string;
    baseUrl: string;
    apiKeyPath: string;

    constructor(name: string, baseUrl = "", apiKeyPath = "") {
        this.name = name;
        this.baseUrl = baseUrl;
        this.apiKeyPath = apiKeyPath;
    }
}

export const providers = {
    Digiroad: new Provider("Digiroad", process.env.DIGIROAD_API, process.env.DIGIROAD_API_KEY)
}

export const AssetTypes = [
    new AssetType("speed_limits", "speedLimit", "maximumSpeedLimit", "kph", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("length_limits", "restrictionForVehicles", "maximumLength", "m", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("width_limits", "restrictionForVehicles", "maximumWidth", "m", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("height_limits", "restrictionForVehicles", "maximumHeight", "m", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("total_weight_limits", "restrictionForVehicles", "maximumLadenWeight", "kg", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("trailer_truck_weight_limits", "restrictionForVehicles", "maximumLadenWeight", "kg", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("axle_weight_limits", "restrictionForVehicles", "maximumWeightPerSingleAxle", "kg", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("stop_sign", "passingWithoutStoppingProhibited", "", "", providers.Digiroad, new PointTnItsConverter),
    new AssetType("obstacles", "closedToAllVehiclesInBothDirections", "", "", providers.Digiroad, new PointTnItsConverter),
    new AssetType("pedestrian_crossing", "pedestrianCrossing", "", "", providers.Digiroad, new PointTnItsConverter),
    new AssetType("vehicle_prohibitions", "noEntry", "", "", providers.Digiroad, new LinearTnItsConverter),
    new AssetType("warning_signs_group", "roadSign", "", "", providers.Digiroad, new PointTnItsConverter, "fixedPlateRoadSign")
];
