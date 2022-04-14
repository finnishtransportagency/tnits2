import { vehicleChars } from "./utils";

export const VehicleProhibitions = {
    getProhibition(typeId: number): Array<Prohibition> {
        const excludedTypes = [15, 23, 26, 27, 28, 21, 22, 12];
        const type = DigiroadProhibitions[typeId];
        if (excludedTypes.includes(typeId) || type == undefined) {
            return [];
        }
        return type;
    },
    getExceptions(exceptions: number[]): Array<Prohibition> {
        const excludedTypes = [15, 23, 26, 27, 28, 12, 22];
        const filtered = exceptions.filter(item => !excludedTypes.includes(item) && DigiroadProhibitions[item] != undefined);
        return filtered.flatMap(prohibition => DigiroadProhibitions[prohibition]);
    }
}

export class Prohibition {
    value: string;
    type: string;

    constructor(value: string, type: string) {
        this.value = value;
        this.type = type;
    }
}

const DigiroadProhibitions: {[key: number]: Prohibition[]} = {
    2:  [new Prohibition("anyVehicle", vehicleChars.vehicleType)],
    3:  [new Prohibition("anyVehicle", vehicleChars.vehicleType)],
    4:  [new Prohibition("lorry", vehicleChars.vehicleType)],
    5:  [new Prohibition("bus", vehicleChars.vehicleType)],
    6:  [new Prohibition("van", vehicleChars.vehicleType)],
    7:  [new Prohibition("passangerCar", vehicleChars.vehicleType)],
    8:  [new Prohibition("taxi", vehicleChars.vehicleUsage)],
    9:  [new Prohibition("motorcycle", vehicleChars.vehicleType)],
    10: [new Prohibition("moped", vehicleChars.vehicleType)],
    11: [new Prohibition("bicycle", vehicleChars.vehicleType)],
    12: [], // PEDESTRIAN -- not in standard
    13: [new Prohibition("articulatedVehicle", vehicleChars.vehicleType)],
    14: [new Prohibition("agriculturalVehicle", vehicleChars.vehicleType)],
    19: [new Prohibition("military", vehicleChars.vehicleUsage)],
    21: [new Prohibition("cityLogistics", vehicleChars.vehicleUsage), 
         new Prohibition("emergencyServices", vehicleChars.vehicleUsage)],
    22: [] // RESIDENTIAL -- not in standard
};