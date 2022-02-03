import { codeListRef, openLrVersion, CodeListReference } from "./utils";
import { v4 as uuid } from "uuid";

export class LocationReference {
    OpenLRLocationReference?: OpenLrLocationReference;
    GeometryLocationReference?: GeometryLocationReference;

    addOpenLrLocation(reference: string) {
        this.OpenLRLocationReference = new OpenLrLocationReference(reference);
    }

    addLinearEncodedLocation(geometry: string) {
        this.GeometryLocationReference = new GeometryLocationReference();
        this.GeometryLocationReference.encodedGeometry.addGmlLineString(geometry);
    }

    addPointEncodedLocation(geometry: string) {
        this.GeometryLocationReference = new GeometryLocationReference();
        this.GeometryLocationReference.encodedGeometry.addGmlPoint(geometry);
    }
}

/** OpenLR location reference */
class OpenLrLocationReference  {
    binaryLocationReference: BinaryLocationRef;

    constructor(reference: string) {
        this.binaryLocationReference = new BinaryLocationRef(reference);
    }
}

class BinaryLocationRef  {
    BinaryLocationReference: BinaryLocationReference;

    constructor(reference: string) {
        this.BinaryLocationReference = new BinaryLocationReference(reference);
    }
}

class BinaryLocationReference  {
    base64String: string;
    openLRBinaryVersion: CodeListReference;

    constructor(reference: string) {
        const url = codeListRef.openLr;
        this.base64String = reference;
        this.openLRBinaryVersion = new CodeListReference(url, openLrVersion);
    }
}

/** Encoded geometry location reference */
class GeometryLocationReference {
    encodedGeometry: EncodedGeometry;

    constructor() {
        this.encodedGeometry = new EncodedGeometry();
    }
}

class EncodedGeometry {
    'gml:LineString'?: GmlLineString;
    'gml:Point'?: GmlPoint;

    addGmlLineString(geometry: string) {
        this["gml:LineString"] = new GmlLineString(geometry);
    }

    addGmlPoint(geometry: string) {
        this["gml:Point"] = new GmlPoint(geometry);
    }
}

class GmlLineString {
    $: GmlAttributes;
    'gml:posList': string;

    constructor(geometry: string) {
        this.$ = new GmlAttributes();
        this["gml:posList"] = geometry;
    }
}

class GmlPoint {
    $: GmlAttributes;
    'gml:pos': string;

    constructor(geometry: string) {
        this.$ = new GmlAttributes();
        this["gml:pos"] = geometry;
    }
}

class GmlAttributes {
    'gml:id': string;
    srsDimension: number;
    srsName: string;

    constructor() {
        this["gml:id"] = `_${uuid()}`;
        this.srsDimension = 2;
        this.srsName = "EPSG:4326";
    }
}