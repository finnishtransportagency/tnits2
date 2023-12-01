import { AssetType } from "./helper/asset_types";
import { RoadFeatures } from "./helper/road_feature";
import { Change } from "./helper/interfaces";
import { codeListRef, CodeListReference, localDateTimeToDate } from "./helper/utils";
import { LocationReference } from "./helper/location_reference";
import { RoadFeatureProperties } from "./helper/road_feature_properties";
import { Condition } from "./helper/conditions";

export class AssetConverter {
    toRoadFeatures(feature: Change, assetType: AssetType, validFromTime: string): RoadFeatures {
        try {
            const providerId = "FI.LiVi.OTH";
            const properties = this.properties(assetType, feature);
            const conditions = this.conditions(assetType, feature, validFromTime);
            const encodedGeometry = this.encodedGeometry(feature)
            const sourceRef = new CodeListReference(codeListRef.source, assetType.source);
            const typeRef = new CodeListReference(codeListRef.type, assetType.featureType);
            const openLR = assetType.service.encodeOpenLRLocationString(feature);
            return new RoadFeatures(
                validFromTime, feature.properties.changeType, sourceRef, typeRef, properties,
                providerId, feature.id, this.openLrLocationReference(openLR), encodedGeometry, conditions
            );
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            throw new Error(`Skipping road feature ${feature.id} due to error in conversion.`);
        }
    }

    encodeOpenLRLocationString(feature: Change): string { return ""; }
    properties(assetType: AssetType, feature: Change): RoadFeatureProperties[] { return []; }
    conditions(assetType: AssetType, feature: Change, validFrom: string): Condition | undefined { return; }
    geometry(feature: Change) {}
    encodedGeometry(feature: Change): LocationReference { return new LocationReference() }
    splitFeaturesApplicableToBothDirections(changes: Change[]): Array<Change> { return changes; }

    splitRoadFeatures(changes: Array<Change>, assetType: AssetType, validFrom: string): RoadFeatures[] {
        const features = this.splitFeaturesApplicableToBothDirections(changes);
        const roadFeatures: RoadFeatures[] = [];
        features.forEach(feature => {
            try {
                const changeType = feature.properties.changeType;
                let realValidFrom = "";
                switch (changeType) {
                    case "Add":
                        realValidFrom = localDateTimeToDate(feature.properties.createdAt).toISOString();
                        break;
                    case "Modify":
                        realValidFrom = localDateTimeToDate(feature.properties.modifiedAt).toISOString();
                        break;
                    case "Remove":
                    default:
                        realValidFrom = validFrom;
                }
                roadFeatures.push(this.toRoadFeatures(feature, assetType, realValidFrom));
            } catch (err) {
                if (err instanceof Error) console.error(err.message);
            }
        });
        return roadFeatures;
    }

    openLrLocationReference(reference: string): LocationReference {
        const locationRef = new LocationReference();
        locationRef.addOpenLrLocation(reference);
        return locationRef;
    }
}