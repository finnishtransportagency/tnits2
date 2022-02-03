import { GeoCoordinates } from 'openlr-js/lib/es5/map/GeoCoordinates';
import { Line } from 'openlr-js/lib/es5/map/Line';
import { Node } from 'openlr-js/lib/es5/map/Node';
import { Point } from '../geometry/point';
import { CoordinateTransform } from '../geometry/coordinate_transform';

export class DigiroadNode implements Node {
    protected _coordinates: number[];

    constructor(point: Point) {
        // X and Y coordinates converted to WSG84
        this._coordinates = CoordinateTransform.convertToWgs84([[point.x, point.y]]).flat();
    }

    getLongitudeDeg(): number {
        return this._coordinates[0];
    }

    getLatitudeDeg(): number {
        return this._coordinates[1];
    }

    getGeoCoordinates(): GeoCoordinates {
        return GeoCoordinates.fromValues(this._coordinates[0], this._coordinates[1]);
    }

    /** @note A line is connected to itself. */
    getNumberConnectedLines(): number {
        return 1;
    }

    getConnectedLines(): Array<Line> { return [] }
    getOutgoingLines(): Array<Line> { return [] }
    getIncomingLines(): Array<Line> { return [] }
    getID(): number { return 0 }
}