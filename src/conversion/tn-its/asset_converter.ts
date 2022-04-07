import { AssetType } from "./helper/asset_types";
import { RoadFeatures } from "./helper/road_feature";
import { Change } from "./helper/interfaces";
import { codeListRef, CodeListReference } from "./helper/utils";
import { LocationReference } from "./helper/location_reference";
import { RoadFeatureProperties } from "./helper/road_feature_properties";
import { Condition } from "./helper/conditions";

export class AssetConverter {
    toRoadFeatures(feature: Change, assetType: AssetType, validFromTime: string): RoadFeatures {
        const providerId = "FI.LiVi.OTH";
        const properties = this.properties(assetType, feature);
        const conditions = this.conditions(assetType, feature, validFromTime);
        const encodedGeometry = this.encodedGeometry(feature)
        const sourceRef = new CodeListReference(codeListRef.source, assetType.source);
        const typeRef = new CodeListReference(codeListRef.type, assetType.featureType);
        
        try {
            const openLR = assetType.service.encodeOpenLRLocationString(feature);
            return new RoadFeatures(
                validFromTime, feature.properties.changeType, sourceRef, typeRef, properties,
                providerId, feature.id, this.openLrLocationReference(openLR), encodedGeometry, conditions
            );
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            throw new Error(`Skipping road feature ${feature.id} due to error in OpenLR encoding.`);
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
                roadFeatures.push(this.toRoadFeatures(feature, assetType, validFrom));
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