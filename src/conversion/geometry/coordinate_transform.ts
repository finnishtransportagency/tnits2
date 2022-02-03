import proj4 from 'proj4';

/**
 * Transform OTH EPSG:3067 map coordinates ((x, y) meters) to WGS84 geocoordinates ((lon, lat) degrees).
 */
export const CoordinateTransform = {
    convertToWgs84: function (coordinates: number[][]): number[][] {
        const OTHReferencingSystem = "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
        const openLRReferencingSystem = proj4.WGS84;
        const transformedCoordinates = [];
        for (const coord of coordinates) {
            transformedCoordinates.push(proj4(OTHReferencingSystem, openLRReferencingSystem, coord));
        }
        return transformedCoordinates;
    }
}