import { AssetConverter } from "./asset_converter";
import { CoordinateTransform } from "../geometry/coordinate_transform";
import { OpenLREncoder } from "../openlr/openlr_encoder";
import { Point } from "../geometry/point";
import { LinearChange, LinearFeature, ProhibitionFeature } from "./helper/interfaces";
import { AssetType } from "./helper/asset_types";
import { RoadFeatureProperties } from "./helper/road_feature_properties";
import { LocationReference } from "./helper/location_reference";
import { VehicleProhibitions } from "./helper/prohibitions";
import { ConditionSet, conditionOperations, Condition } from "./helper/conditions";
import { conditionOperators, defaultLinkReference } from "./helper/utils";

export class LinearTnItsConverter extends AssetConverter {
    
    encodeOpenLRLocationString(feature: LinearChange): string {
        const properties = feature.properties;
        const link = properties['link'];
        const coordinates= link.geometry.coordinates;
        const points = coordinates.map(([x, y, z]) => new Point(x, y, z));
        const linkLength = link.properties.length; 
        const functionalClass = link.properties.functionalClass;
        const linkType = link.properties['type'];

        const isOppositeDirection = properties.sideCode === 3;
        const [linkGeometry, startM, endM] = isOppositeDirection ? 
            [points.reverse(), linkLength - properties.endMeasure, linkLength - properties.startMeasure] :
            [points, properties.startMeasure, properties.endMeasure]
        try {
            return OpenLREncoder.encodeAssetOnLink(
                startM, endM, linkGeometry, linkLength, functionalClass, linkType, defaultLinkReference + link.id);
        } catch (err) {
            throw err;           
        }
    }

    properties(assetType: AssetType, feature: LinearFeature): RoadFeatureProperties[] {
        switch (assetType.id) {
            case "length_limits": case "width_limits": case "height_limits":
                // Convert centimeters to meters
                const value = feature['properties'].value / 100;
                const property = new RoadFeatureProperties();
                property.addGenericRoadFeatureProperty(assetType.propertyType, value, assetType.unit);
                return [property];
            case "vehicle_prohibitions":
                return [];
            default:
                const properties = new RoadFeatureProperties();
                properties.addGenericRoadFeatureProperty(assetType.propertyType, feature['properties'].value, assetType.unit);
                return [properties];
        }
    }

    conditions(assetType: AssetType, feature: LinearChange, validFrom: string): Condition | undefined {
        switch (assetType.id) {
            case "trailer_truck_weight_limits":
                // Restriction only applies to articulated vehicles
                const vehicleType = VehicleProhibitions.getProhibition(13); 
                const vehicleCondition = conditionOperations.createVehicleCondition(false, vehicleType);
                return vehicleCondition;
            case "vehicle_prohibitions":
                const conditions = this.vehicleConditions(feature as ProhibitionFeature, validFrom);
                if (conditions.length === 1) {
                    return conditions[0];
                } else {
                    const setOfSets = new ConditionSet(conditionOperators.or);
                    conditions.forEach(condition => setOfSets.addCondition(condition));
                    return new Condition().addConditionSet(setOfSets);
                }
        }
    }

    geometry(feature: LinearChange): string {
        const coordinates = feature.geometry.coordinates.map(x => x.slice(0, 2));
        const transformedCoordinates = CoordinateTransform.convertToWgs84(coordinates);
        return transformedCoordinates.flat().join(' ');
    }

    encodedGeometry(feature: LinearChange): LocationReference {
        const locationRef = new LocationReference();
        locationRef.addLinearEncodedLocation(this.geometry(feature));
        return locationRef;
    }

    splitFeaturesApplicableToBothDirections(changes: LinearChange[]): Array<LinearChange> {
        return changes.flatMap(feature => {
            if (feature.properties.sideCode === 1) {
                const inDirection = JSON.parse(JSON.stringify(feature));          // Deep copy of feature
                const inOppositeDirection = JSON.parse(JSON.stringify(feature));  // Deep copy of feature
                inDirection.properties.sideCode = 2;
                inOppositeDirection.properties.sideCode = 3;
                return [inDirection, inOppositeDirection];
            } else {
                return [feature];
            }
        });
    }

    vehicleConditions(feature: ProhibitionFeature, validFrom: string): Condition[] {
        const values = feature.properties.value;
        const conditions: Condition[] = [];
        values.forEach(value => {
            const prohibition = VehicleProhibitions.getProhibition(value.typeId);
            const exceptions = VehicleProhibitions.getExceptions(value.exceptions);
            const validityPeriod = value.validityPeriod;

            if (prohibition.length) {
                const set = new ConditionSet(conditionOperators.and);
                set.addCondition(conditionOperations.createVehicleCondition(false, prohibition));
                if (exceptions.length) set.addCondition(conditionOperations.createVehicleCondition(true, exceptions));
                if (validityPeriod.length) conditionOperations.createTimeCondition(false, set, validFrom, validityPeriod);
                conditions.push(new Condition().addConditionSet(set));
            }
        });
        if (conditions.length) return conditions;
        else {
            throw new Error(`Unrecognized or excluded prohibiton type "${values[0].typeId}" on asset ${feature.id}`);
        }
    }
}