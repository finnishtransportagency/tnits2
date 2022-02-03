export class Point {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}