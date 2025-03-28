import { AssetConverter } from "./asset_converter";
import { CoordinateTransform } from "../geometry/coordinate_transform";
import { OpenLREncoder } from "../openlr/openlr_encoder";
import { Point } from "../geometry/point";
import { PointFeature } from "./helper/interfaces";
import { defaultLinkReference } from "./helper/utils";
import { LocationReference } from "./helper/location_reference";
import { AssetType } from "./helper/asset_types";
import { RoadFeatureProperties } from "./helper/road_feature_properties";
import { RoadSign } from "./helper/road_signs";

export class PointTnItsConverter extends AssetConverter {

    encodeOpenLRLocationString(feature: PointFeature): string {
        const properties = feature.properties;
        const link = properties['link'];
        const coordinates = link.geometry.coordinates;
        const points = coordinates.map(([x, y, z]) => new Point(x, y, z));
        const linkLength = link.properties.length;
        const functionalClass = link.properties.functionalClass;
        const linkType = link.properties['type'];
        return OpenLREncoder.encodePointAssetOnLink(
            properties.mValue, properties.mValue, points, linkLength, functionalClass,
            linkType, defaultLinkReference + link.id, properties.sideCode);
    }

    properties(assetType: AssetType, feature: PointFeature): RoadFeatureProperties[] {
        switch (assetType.id) {
            case "warning_signs_group":
                const warningSign = RoadSign.getWarningSign(feature.properties.typeValue);
                const roadSignProperties = new RoadFeatureProperties();
                roadSignProperties.addRoadSignProperty(warningSign.gddCode, warningSign.additionalText);
                return [roadSignProperties];
            default:
                return [];
        }
    }

    geometry(feature: PointFeature): string {
        const coordinates = [feature.geometry.coordinates].map(x => x.slice(0, 2));
        const transformedCoordinates = CoordinateTransform.convertToWgs84(coordinates);
        return transformedCoordinates.flat().join(' ');
    }

    encodedGeometry(feature: PointFeature): LocationReference {
        const locationRef = new LocationReference();
        locationRef.addPointEncodedLocation(this.geometry(feature));
        return locationRef;
    }

    splitFeaturesApplicableToBothDirections(changes: PointFeature[]): Array<PointFeature> {
        return changes;
    }
}