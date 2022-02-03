import { DigiroadNode } from './digiroad_node';
import { Point } from '../geometry/point';
import { FunctionalRoadClass } from 'openlr-js/lib/es5/map/FunctionalRoadClass';
import { FormOfWay } from 'openlr-js/lib/es5/map/FormOfWay';
import { GeoCoordinates } from 'openlr-js/lib/es5/map/GeoCoordinates';
import { GeometryUtils } from 'openlr-js/lib/es5/map/utils/GeometryUtils';
import { Line } from 'openlr-js/lib/es5/map/Line';

export class DigiroadLine implements Line {
    protected _id: number;
    protected _geoCoordinates: GeoCoordinates[];
    protected _length: number;
    protected _linkType: number;
    protected _functionalClass: number;
    protected _startNode: DigiroadNode;
    protected _endNode: DigiroadNode;

    constructor(id: number, geometry: Point[], length: number, linkType = 1, functionalClass = 1) {
        this._id = id;
        this._geoCoordinates = geometry.map(_ => new DigiroadNode(_).getGeoCoordinates());
        this._length = length;
        this._linkType = linkType;
        this._functionalClass = functionalClass;
        this._startNode = new DigiroadNode(geometry[0]);
        this._endNode = new DigiroadNode(geometry[geometry.length - 1]);
    }

    /**
     * Get the coordinate a certain distance in meters along the line from start.
     * @param distanceAlong     Distance in meters along the line from the start
     * @returns                 GeoCoordinates on the line at this distance
     */
    getGeoCoordinateAlongLine(distanceAlong: number): GeoCoordinates {
        if (distanceAlong < 0) return this.getStartNode().getGeoCoordinates();
        else if (distanceAlong >= this.getLineLength()) return this.getEndNode().getGeoCoordinates();

        let previous = null;
        let remainingMeasure = distanceAlong;

        for (const current of this._geoCoordinates) {
            if (previous) {
                const segmentLength = GeometryUtils.geoCoordinatesDistance(previous, current);
                if (remainingMeasure > segmentLength) {
                    remainingMeasure -= segmentLength;
                } else {
                    const fraction = remainingMeasure / segmentLength;
                    return this._getGeoCoordinateAtFraction(previous, current, fraction);
                }
            }
            previous = current;
        }
        throw new Error("OpenLR Error: Inconsistencies between the line geometry and length");
    }

    getID() {
        return this._id;
    }

    /**
     * Get length of the line in meters
     * @returns length in 
     */
    getLineLength() {
        return this._length;
    }

    getFRC(): FunctionalRoadClass {
        switch (this._functionalClass){
            case 1: return FunctionalRoadClass.FRC_0;
            case 2: return FunctionalRoadClass.FRC_1;
            case 3: return FunctionalRoadClass.FRC_2;
            case 4: return FunctionalRoadClass.FRC_3;
            case 5: return FunctionalRoadClass.FRC_4;
            case 6: return FunctionalRoadClass.FRC_5;
            case 7: return FunctionalRoadClass.FRC_6;
            case 8: return FunctionalRoadClass.FRC_7;
            default: return FunctionalRoadClass.FRC_7;
        }
    }

    getStartNode(): DigiroadNode {
        return this._startNode;
    }

    getEndNode(): DigiroadNode {
        return this._endNode;
    }

    getFOW(): FormOfWay {
        switch (this._linkType) {
            case 1: return FormOfWay.MOTORWAY;
            case 2: return FormOfWay.MULTIPLE_CARRIAGEWAY;
            case 3: return FormOfWay.SINGLE_CARRIAGEWAY;
            case 4: return FormOfWay.OTHER;
            case 5: return FormOfWay.ROUNDABOUT;
            case 6: return FormOfWay.SLIPROAD;
            case 7: return FormOfWay.OTHER;
            case 8: return FormOfWay.OTHER;
            case 9: return FormOfWay.OTHER;
            case 10: return FormOfWay.OTHER;
            case 11: return FormOfWay.OTHER;
            case 12: return FormOfWay.OTHER;
            case 13: return FormOfWay.OTHER;
            case 21: return FormOfWay.OTHER;
            default: return FormOfWay.UNDEFINED;
        }
    }

    /**
     * Get the distance in meters along a line to the point on the line that is closest to a given coordinate.
     * @param latitude  Latitude of coordinate
     * @param longitude Longitude of coordinate
     * @returns         Distance from start in meters
     */
    measureAlongLine(latitude: number, longitude: number): number {
        if (this._geoCoordinates.length < 2) return 0;

        const pointOnLine = GeoCoordinates.fromValues(longitude, latitude);
        let measure = 0;
        
        for (let i = 0; i < this._geoCoordinates.length - 1; i++) {
            const point = this._geoCoordinates[i];
            const nextPoint = this._geoCoordinates[i + 1];
            const pointToPointOnLine    = GeometryUtils.geoCoordinatesDistance(point, pointOnLine);
            const nextToPointOnLine     = GeometryUtils.geoCoordinatesDistance(nextPoint, pointOnLine);
            const pointToNext           = GeometryUtils.geoCoordinatesDistance(point, nextPoint);
            
            // Round values to five decimals for comparison
            const foundOnLine = this._roundToDecimals(pointToPointOnLine + nextToPointOnLine, 5) == this._roundToDecimals(pointToNext, 5);
            
            if (foundOnLine) {
                return Math.floor(measure + pointToPointOnLine);
            }
            measure += pointToNext;
        }
        return measure;
    }

    /**
     * Round number to given number of decimals
     * @param num               Number to round
     * @param numberOfDecimals  Number of decimals
     * @returns                 Number with given number of decimals
     */
    protected _roundToDecimals(num: number, numberOfDecimals: number): number {
        const round = Math.pow(10, numberOfDecimals);
        return Math.round(num * round) / round;
    }

    protected _getGeoCoordinateAtFraction(from: GeoCoordinates, to: GeoCoordinates, fraction: number): GeoCoordinates {
        if (fraction <= 0.0) return from;
        else if (fraction >= 1.0) return to;

        const longitude = from.getLongitudeDeg() + ((to.getLongitudeDeg() - from.getLongitudeDeg()) * fraction);
        const latitude = from.getLatitudeDeg() + ((to.getLatitudeDeg() - from.getLatitudeDeg()) * fraction);

        return GeoCoordinates.fromValues(longitude, latitude);
    }

    getPrevLines(): Array<Line> { return []; }
    getNextLines(): Array<Line> { return []; }
    distanceToPoint(latitude: number, longitude: number): number { return 0; }
    getShapeCoordinates(): Array<GeoCoordinates> { return []; }
    getNames(): {[Key: string]: Array<string>;} { return {}; }
}
