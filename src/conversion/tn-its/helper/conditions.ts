import { TimePeriod, ValidityPeriod } from "./interfaces";
import { Prohibition } from "./prohibitions";
import { codeListRef, conditionOperators, CodeListReference, validityPeriodOperations, vehicleChars } from "./utils";

export const conditionOperations = {
    createVehicleCondition(negate: boolean, prohibition: Prohibition): Condition {
        const vehicleCondition = new VehicleCondition(negate);
        switch (prohibition.type) {
            case vehicleChars.vehicleType:
                vehicleCondition.addVehicleType(prohibition.value);
                break;
            case vehicleChars.vehicleUsage:
                vehicleCondition.addVehicleUsage(prohibition.value);
                break;
        };
        return new Condition().addVehicleCondition(vehicleCondition);
    },

    createTimeCondition(negate: boolean, validFrom: string, validityPeriods: ValidityPeriod[]): Condition {
        const overallPeriod = new OverallPeriod(validFrom);
        const periodsGroupedByTime = this.groupByValidityTime(validityPeriods);

        for (const time of periodsGroupedByTime) {
            const period = new Period();
            const days = time.days.flatMap(day => validityPeriodOperations.getDays(day));
            // If the time period is valid all days, there is no need to specify a day of a week
            if (days.length && days.length < 7) {
                period.addDayWeekMonth(days);
            }
            period.addTimePeriodOfDay(time.startTime, time.endTime);
            overallPeriod.addValidPeriod(period);
        }
        return new Condition().addTimeCondition(new TimeCondition(negate, overallPeriod));
    },

    groupByValidityTime(validityPeriods: ValidityPeriod[]): TimePeriod[] {
        const periodsGroupedByTime: TimePeriod[] = [];
        for (const period of validityPeriods) {
            const start = validityPeriodOperations.getStartTime(period);
            const end = validityPeriodOperations.getEndTime(period);
            const withSameTime = periodsGroupedByTime.find(time => time.startTime == start && time.endTime == end);
            if (withSameTime == undefined) {
                periodsGroupedByTime.push({ startTime: start, endTime: end, days: [period.days] })
            } else if (!withSameTime.days.includes(period.days)) {
                withSameTime.days.push(period.days);
            }
        }
        return periodsGroupedByTime;
    }
}

export class Condition {
    ConditionSet?: ConditionSet;
    TimeCondition?: TimeCondition;
    VehicleCondition?: VehicleCondition;

    noPriorConditions() {
        return this.ConditionSet == undefined && this.VehicleCondition == undefined &&
               this.TimeCondition == undefined;
    }

    addConditionSet(set: ConditionSet) {
        if (this.noPriorConditions()) this.ConditionSet = set;
        return this;
    }

    addTimeCondition(time: TimeCondition) {
        if (this.noPriorConditions()) this.TimeCondition = time;
        return this;
    }

    addVehicleCondition(vehicle: VehicleCondition) {
        if (this.noPriorConditions()) this.VehicleCondition = vehicle;
        return this;
    }
}

/** CONDITION SET */
export class ConditionSet {
    operator: string;
    conditions: Array<Condition>;

    constructor(operator: string) {
        this.operator = operator;
        this.conditions = [];
    }

    addCondition(condition: Condition) {
        this.conditions.push(condition);
    }
}

/** TIME CONDITION */
export class TimeCondition {
    negate?: boolean;
    validityPeriod: {
        Validity: {
            validityTimeSpecification: {
                OverallPeriod: OverallPeriod
            }
        }
    };

    constructor(negate: boolean, overallPeriod: OverallPeriod) {
       if (negate) this.negate = negate;
        this.validityPeriod = {
            Validity: {
                validityTimeSpecification: {
                    OverallPeriod: overallPeriod
                }
            }
        };
    }
}

export class OverallPeriod {
    overallStartTime: string;   // DateTime
    overallEndTime?: string;    // DateTime
    validPeriod: Period[];
    exceptionPeriod: Period[];

    constructor(startTime: string, endTime?: string) {
        this.overallStartTime = startTime;
        if (endTime != undefined) this.overallEndTime = endTime;
        this.validPeriod = [];
        this.exceptionPeriod = [];
    }

    addValidPeriod(period: Period) {
        this.validPeriod.push(period);
    }

    addExceptionPeriod(period: Period) {
        this.exceptionPeriod.push(period);
    }
}

export class Period  {
    Period: {
        startOfPeriod?: string, // DateTime
        endOfPeriod?: string,   // DateTime
        periodName?: string,
        recurringDayWeekMonthPeriod?: DayWeekMonth[],
        recurringTimePeriodOfDay?: TimePeriodOfDay[]
    }

    constructor(start?: string, end?:string, name?: string) {
        this.Period = {};
        if (start != undefined) this.Period.startOfPeriod = start;
        if (end != undefined)   this.Period.endOfPeriod = end;
        if (name != undefined)  this.Period.periodName = name;
    }

    addDayWeekMonth(days: string[], weeks: string[] = [], months: string[]= []) {
        if (this.Period.recurringDayWeekMonthPeriod == undefined)
            this.Period.recurringDayWeekMonthPeriod = [];
        this.Period.recurringDayWeekMonthPeriod.push(new DayWeekMonth(days, weeks, months));
    }

    addTimePeriodOfDay(start: string, end: string) {
        if (this.Period.recurringTimePeriodOfDay == undefined)
            this.Period.recurringTimePeriodOfDay = [];
        this.Period.recurringTimePeriodOfDay.push(new TimePeriodOfDay(start, end))
    }
}

class DayWeekMonth {
    DayWeekMonth: {
        applicableDay: Array<string>;
        applicableWeek: Array<string>;
        applicableMonth: Array<string>;
    }

    constructor(days: string[], weeks: string[], months: string[]) {
        this.DayWeekMonth = {
            applicableDay: days,
            applicableWeek: weeks,
            applicableMonth: months
        }
    }
}

class TimePeriodOfDay {
    TimePeriodOfDay: {
        startTimeOfPeriod: string,
        endTimeOfPeriod: string
    }

    constructor(start: string, end: string) {
        this.TimePeriodOfDay = {
            startTimeOfPeriod: start,
            endTimeOfPeriod: end
        }
    }
}

/** VEHICLE CONDITION */
export class VehicleCondition {
    negate?: Boolean;
    vehicleCharacteristics: VehicleCharacteristics;

    constructor(negate: boolean) {
        if (negate) this.negate = negate;
        this.vehicleCharacteristics = new VehicleCharacteristics();
    }

    addVehicleType(vehicleType: string) {
        this.vehicleCharacteristics.addVehicleType(vehicleType);
    }

    addVehicleUsage(vehicleUsage: string) {
        this.vehicleCharacteristics.addVehicleUsage(vehicleUsage);
    }
}

class VehicleCharacteristics {
    VehicleCharacteristics: {
        vehicleType: Array<CodeListReference>,
        vehicleUsage?: CodeListReference
    }

    constructor() {
        this.VehicleCharacteristics = {
            vehicleType: []
        }
    }

    addVehicleType(vehicleType: string) {
        this.VehicleCharacteristics.vehicleType.push(new CodeListReference(codeListRef.vehicleType, vehicleType));
    }

    addVehicleUsage(vehicleUsage: string) {
        this.VehicleCharacteristics["vehicleUsage"] = new CodeListReference(codeListRef.vehicleUsage, vehicleUsage);
    }
}