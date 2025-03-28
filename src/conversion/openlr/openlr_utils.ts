import {LocationSpecifier, SideCode} from "../tn-its/helper/utils";
import {Orientation} from 'openlr-js/lib/es5/data/location/data/Orientation';
import {SideOfRoad} from 'openlr-js/lib/es5/data/location/data/SideOfRoad';

export function sideCodeToOpenLROrientation(sideCode: SideCode): Orientation {
    switch (sideCode) {
        case SideCode.BothDirections:
            return Orientation.BOTH;
        case SideCode.TowardsDigitizing:
            return Orientation.WITH_LINE_DIRECTION;
        case SideCode.AgainstDigitizing:
            return Orientation.AGAINST_LINE_DIRECTION;
        default:
            return Orientation.NO_ORIENTATION_OR_UNKNOWN;
    }
};

export function locationSpecifierToOpenLRSideOfRoad(locationSpecifier: LocationSpecifier): SideOfRoad  {
    switch (locationSpecifier) {
        case LocationSpecifier.Right:
            return SideOfRoad.RIGHT;
        case LocationSpecifier.Left:
            return SideOfRoad.LEFT;
        default:
            return SideOfRoad.ON_ROAD_OR_UNKNOWN;
    }
};