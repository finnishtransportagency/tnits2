import { BinaryEncoder } from 'openlr-js/lib/es5';
import { LocationReferencePoint } from 'openlr-js/lib/es5/data/LocationReferencePoint';
import { RawLineLocationReference } from 'openlr-js/lib/es5/data/raw-location-reference/RawLineLocationReference';
import { Offsets }from 'openlr-js/lib/es5/data/Offsets';
import { GeometryUtils } from 'openlr-js/lib/es5/map/utils/GeometryUtils';
import { GeoCoordinates } from 'openlr-js/lib/es5/map/GeoCoordinates';
import { DigiroadLine } from './digiroad_line';
import { Point } from '../geometry/point';

export const OpenLREncoder = {
    encodeAssetOnLink: function (startMeasure: number, endMeasure: number, 
        linkGeometry: Point[], linkLength: number, functionalClass: number, 
        linkType:number, linkId: string) {
        try {
            const line = new DigiroadLine(1, linkGeometry, Math.floor(linkLength), linkType, functionalClass);
            const realEndMeasure = linkLength > endMeasure ? linkLength - endMeasure : 0;
            const lineLocationRefs = getLocationReferencePoints(line, startMeasure, realEndMeasure);
            const offsets = Offsets.fromValues( Math.floor(startMeasure), Math.floor(realEndMeasure));

            const encoder = new BinaryEncoder();
            const rawLocationReference = RawLineLocationReference.fromLineValues(linkId, lineLocationRefs, offsets);
            const encodedLocationReference = encoder.encodeDataFromRLR(rawLocationReference);
            const openLrBinary = encodedLocationReference.getLocationReferenceData();
            if (!openLrBinary) throw new Error(`Could not form OpenLR string`);
            return openLrBinary.toString('base64');
        } catch (err) {
            console.error(err);
            throw new Error(`OpenLRException(startMeasure = ${startMeasure}, endMeasure = ${endMeasure}, linkGeometry = ${linkGeometry}, linkLength = ${linkLength}, functionalClass = ${functionalClass}, linkType = ${linkType})`);
        }
    }
};

/**
 * Return location reference points for line
 * @param line      DigiroadLine
 * @param startM    Start measure
 * @param endM      Real end measure
 * @returns         Array of location reference points
 */
function getLocationReferencePoints(line: DigiroadLine, startM: number, endM: number): LocationReferencePoint[] {
    try {
        const points = getLocationPoints(line, startM, endM);
        const lineLocationRefs = [];

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const seqNr = i + 1;

            if (i < points.length - 1) {
                const nextPoint = points[i + 1];
                const distanceToNext = nextPoint.distanceFromStart - point.distanceFromStart;
                lineLocationRefs.push(locationReferencePoint(seqNr, point.coordinates, line, distanceToNext, point.distanceFromStart))
            } else {
                const distanceFromPrevious = point.distanceFromStart - points[i - 1].distanceFromStart;
                lineLocationRefs.push(locationReferencePoint(seqNr, point.coordinates, line, 0, distanceFromPrevious, 2, true));
            }
        }
        return lineLocationRefs;
    } catch (err) {
        throw err;
    }
}

function locationReferencePoint(seqNr: number, coordinate: GeoCoordinates,
        digiroadLine: DigiroadLine, distanceToNext: number, projectionAlongLine = 0,
        bearingDir = 1, isLast = false): LocationReferencePoint {
    const bearing = GeometryUtils.calculateLineBearing(digiroadLine, bearingDir, 20, projectionAlongLine);
    return LocationReferencePoint.fromValues(
        seqNr, digiroadLine.getFRC(), digiroadLine.getFOW(),
        coordinate.getLongitudeDeg(), coordinate.getLatitudeDeg(), Math.round(bearing),
        Math.round(distanceToNext), digiroadLine.getFRC(), isLast);
}

/**
 * Return point positions along line.
 * Contains at least start and end positions. If distance between points exceeds maximum distance,
 * adds appropriate amount of points between start and end.
 * @param line      DigiroadLine
 * @param startM    Start measure
 * @param endM      Real end measure
 * @returns         Array of Location Points
 */
function getLocationPoints(line: DigiroadLine, startM: number, endM: number): Array<LocationPoint> {
    try {
        const maxPointDist = 15000;
        const points = [];

        // Adjust point distance to assure that distance is not greater than offset values
        let distance = maxPointDist > startM ? maxPointDist : Math.floor(startM);
        distance = distance > endM ? distance : Math.floor(endM);

        points.push(line.getStartNode().getGeoCoordinates());
        while ( line.getLineLength() > distance + 0.01 ) {
            points.push(line.getGeoCoordinateAlongLine(distance));
            distance += maxPointDist;
        }
        points.push(line.getEndNode().getGeoCoordinates());

        return points.map(geoCoord => {
            const distanceFromStart = line.measureAlongLine(geoCoord.getLatitudeDeg(), geoCoord.getLongitudeDeg());
            return new LocationPoint(geoCoord, distanceFromStart);
        });
    } catch (err) {
        throw err;
    }
}

class LocationPoint {
    coordinates: GeoCoordinates;
    distanceFromStart: number;

    constructor(coordinates: GeoCoordinates, distance: number) {
        this.coordinates = coordinates;
        this.distanceFromStart = distance
    }
}