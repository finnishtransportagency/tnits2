import { codeListRef, CodeListReference } from "./utils";

export class RoadFeatureProperties {
    GenericRoadFeatureProperty?: GenericRoadFeatureProperty;
    RoadSignProperty?: RoadSignProperty;

    addGenericRoadFeatureProperty(propertyType: string, value: number, unit: string) {
        this.GenericRoadFeatureProperty = new GenericRoadFeatureProperty(propertyType, value, unit);
    }

    addRoadSignProperty(gddCode: string, textContent?: string) {
        this.RoadSignProperty = new RoadSignProperty(gddCode);
        if (textContent) this.RoadSignProperty.addText(textContent);
    }
}

class GenericRoadFeatureProperty {
    type: CodeListReference;
    value?: number;
    valueReference?: CodeListReference;

    constructor(propertyType: string, value?: number, unit?: string) {
        this.type = new CodeListReference(codeListRef.propertyType, propertyType);
        if (value) this.value = value;
        if (unit) this.valueReference = new CodeListReference(codeListRef.uom, unit);
    }
}

class RoadSignProperty {
    gddCode: CodeListReference;
    content?: Content;

    constructor(gddCode: string) {
        this.gddCode = new CodeListReference(codeListRef.roadSignType, gddCode);
    }

    addText(textContent: string) {
        this.content = new Content();
        this.content.RoadSignContent.addText(textContent);
    }
}

class Content {
    RoadSignContent: RoadSignContent;

    constructor() {
        this.RoadSignContent = new RoadSignContent();
    }
}

class RoadSignContent {
    value?: number;
    text?: string;
    natureOfDistanceMeasure?: CodeListReference;

    addText(text: string) {
        this.text = text;
    }
}