import {SideCode} from "../tn-its/helper/utils";
import { Orientation } from 'openlr-js/lib/es5/data/location/data/Orientation';
import { SideOfRoad } from 'openlr-js/lib/es5/data/location/data/SideOfRoad';

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

export function locationSpecifierToOpenLRSideOfRoad(locationSpecifier: number): SideOfRoad  {
    switch (locationSpecifier) {
        case 1:
            return SideOfRoad.RIGHT;
        case 2:
            return SideOfRoad.LEFT;
        case 4:
            return SideOfRoad.BOTH;
        default:
            return SideOfRoad.ON_ROAD_OR_UNKNOWN;
    }
};