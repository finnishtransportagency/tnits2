import { ValidityPeriod } from "./interfaces";

export const defaultLinkReference = "FI.1000018.";

export const codeListRef = {
    source: 'http://spec.tn-its.eu/codelists/RoadFeatureSourceCode#',
    type: 'http://spec.tn-its.eu/codelists/RoadFeatureTypeCode#',
    openLr: 'http://spec.tn-its.eu/codelists/OpenLRBinaryVersionCode#',
    propertyType: 'http://spec.tn-its.eu/codelists/RoadFeaturePropertyTypeCode#',
    roadSignType: 'http://spec.tn-its.eu/codelists/RoadSignTypeCode#gdd',
    uom: 'http://spec.tn-its.eu/codelists/UOMIdentifierCode#',
    vehicleType: 'http://spec.tn-its.eu/codelists/VehicleTypeCode#',
    vehicleUsage: 'http://spec.tn-its.eu/codelists/VehicleUsageCode#'
};

export const openLrVersion = 'v2_4';

// Convert date string of type DD.MM.YYYY HH:MM:ss to Date
export const localDateTimeToDate = (dateTimeString: string): Date => {
    const oldTZ = process.env.TZ;
    process.env.TZ = "Europe/Helsinki";
    const datePattern = /([0-9]{2}).([0-9]{2}).([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/;
    const date = dateTimeString.match(/\d+/g);

    if (datePattern.test(dateTimeString) && date != undefined) {
        const vals = date.map(value => parseInt(value));
        const finnishDate = new Date(vals[2], vals[1] - 1, vals[0], vals[3], vals[4], vals[5]);
        process.env.TZ = oldTZ;
        return finnishDate;
    } else {
        process.env.TZ = oldTZ;
        throw new Error("Unable to match date to pattern")
    }
}

export const conditionOperators = {
    or: "OR",
    xor: "XOR",
    and: "AND"
}

export const vehicleChars = {
    vehicleType: "vehicleType",
    vehicleUsage: "vehicleUsage"
}

/** Reference attribute used to reference codelist items */
export class CodeListReference {
    $: {
		'xlink:href': string,
		'xlink:title': string
	};

    constructor(url: string, id: string) {
        this.$ = {
			'xlink:href': url + id,
    		'xlink:title': id
		}
    }
}

export const dayOfWeek = {
	1: "monday",
	2: "tuesday",
	3: "wednesday",
	4: "thursday",
	5: "friday",
	6: "saturday",
	7: "sunday"
}

export const validityPeriodOperations = {
    getStartTime (time: ValidityPeriod) {
        return this.getTime(time.startHour, time.startMinute);
    },
    getEndTime (time: ValidityPeriod) {
        return this.getTime(time.endHour, time.endMinute);
    },
    getTime (hours: number, mins: number) {
        const hour = this.toTwoDigitTime(hours);
        const min = this.toTwoDigitTime(mins);
        return `${hour}:${min}:00`;
    },
    toTwoDigitTime (time: number): string {
        return time < 10 ? "0" + time : time.toString();
    },
    getDays (days: number): Array<string> {
    	switch (days) {
            case 1:	return [dayOfWeek[1], dayOfWeek[2], dayOfWeek[3], 
							dayOfWeek[4], dayOfWeek[5]]; // Weekdays
            case 2: return [dayOfWeek[6]]; // Saturday
            case 3: return [dayOfWeek[7]]; // Sunday
			default: return [] 
        }
    }
};

export enum SideCode {
    BothDirections = 1,
    TowardsDigitizing,
    AgainstDigitizing,
    Unknown
}