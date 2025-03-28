import { BinaryEncoder } from 'openlr-js/lib/es5';
import { LocationReferencePoint } from 'openlr-js/lib/es5/data/LocationReferencePoint';
import { RawLineLocationReference } from 'openlr-js/lib/es5/data/raw-location-reference/RawLineLocationReference';
import { RawPointAlongLineLocationReference } from 'openlr-js/lib/es5/data/raw-location-reference/RawPointAlongLineLocationReference';
import { Offsets } from 'openlr-js/lib/es5/data/Offsets';
import { sideCodeToOpenLROrientation } from './openlr_utils';
import { locationSpecifierToOpenLRSideOfRoad } from './openlr_utils';
import { GeometryUtils } from 'openlr-js/lib/es5/map/utils/GeometryUtils';
import { GeoCoordinates } from 'openlr-js/lib/es5/map/GeoCoordinates';
import { DigiroadLine } from './digiroad_line';
import { Point } from '../geometry/point';

export const OpenLREncoder = {
    encodeLinearAssetOnLink: function (startMeasure: number, endMeasure: number,
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
            if (err instanceof Error) console.error(err.message);
            throw new Error(`OpenLRException(startMeasure = ${startMeasure}, endMeasure = ${endMeasure}, linkId = ${linkId}, linkLength = ${linkLength}, functionalClass = ${functionalClass}, linkType = ${linkType}, linkGeometry = ${JSON.stringify(linkGeometry)})`);
        }
    },

    encodePointAssetOnLink: function (startMeasure: number, endMeasure: number,
                                 linkGeometry: Point[], linkLength: number, functionalClass: number,
                                 linkType:number, linkId: string, sideCode: number, locationSpecifier?: number) {
        try {
            const line = new DigiroadLine(1, linkGeometry, Math.floor(linkLength), linkType, functionalClass);
            const [startPoint, endPoint] = getLocationReferencePoints(line, startMeasure, endMeasure);
            const offsets = Offsets.fromValues( Math.floor(startMeasure), Math.floor(endMeasure));
            const encoder = new BinaryEncoder();
            const orientation = sideCodeToOpenLROrientation(sideCode);
            const sideOfRoad = locationSpecifierToOpenLRSideOfRoad(locationSpecifier ? locationSpecifier : 99);
            const rawLocationReference = RawPointAlongLineLocationReference.fromPointAlongLineValues(linkId, startPoint, endPoint, offsets, sideOfRoad, orientation);
            const encodedLocationReference = encoder.encodeDataFromRLR(rawLocationReference);
            const openLrBinary = encodedLocationReference.getLocationReferenceData();
            if (!openLrBinary) throw new Error(`Could not form OpenLR string`);
            return openLrBinary.toString('base64');
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            throw new Error(`OpenLRException(startMeasure = ${startMeasure}, endMeasure = ${endMeasure}, linkId = ${linkId}, linkLength = ${linkLength}, functionalClass = ${functionalClass}, linkType = ${linkType}, linkGeometry = ${JSON.stringify(linkGeometry)})`);
        }
    },
};

/**
 * Return location reference points for line
 * @param line      DigiroadLine
 * @param startM    Start measure
 * @param endM      Real end measure
 * @returns         Array of location reference points
 */
function getLocationReferencePoints(line: DigiroadLine, startM: number, endM: number): LocationReferencePoint[] {
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
    const maxPointDist = 15000;
    const locationPoints = [];
    let distance = maxPointDist;

    locationPoints.push(new LocationPoint(line.getStartNode().getGeoCoordinates(), 0));
    while ( line.getLineLength() > distance + 0.01 ) {
        const geoCoord = line.getGeoCoordinateAlongLine(distance);
        const distanceFromStart = line.measureAlongLine(geoCoord.getLatitudeDeg(), geoCoord.getLongitudeDeg());
        locationPoints.push(new LocationPoint(geoCoord, distanceFromStart));
        distance = distanceFromStart + maxPointDist;
    }
    locationPoints.push(new LocationPoint(line.getEndNode().getGeoCoordinates(), line.getLineLength()));
    return locationPoints;
}

class LocationPoint {
    coordinates: GeoCoordinates;
    distanceFromStart: number;

    constructor(coordinates: GeoCoordinates, distance: number) {
        this.coordinates = coordinates;
        this.distanceFromStart = distance
    }
}