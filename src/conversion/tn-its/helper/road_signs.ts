export const RoadSign = {
    getWarningSign(typeId?: number): WarningSign {
        if (typeId != undefined && warningSignTypes.hasOwnProperty(typeId)) {
            return warningSignTypes[typeId];
        } else {
            return warningSignTypes[9];
        }
    }
}

class WarningSign {
    gddCode: string;
    additionalText: string;

    constructor(gddCode: string, additionalText = "") {
        this.gddCode = gddCode;
        this.additionalText = additionalText;
    }
}

const warningSignTypes: {[key: number]: WarningSign} = {
    9:  new WarningSign("11_999"),
    36: new WarningSign("11_161"),
    37: new WarningSign("11_162"),
    38: new WarningSign("11_211"),
    39: new WarningSign("11_212"),
    40: new WarningSign("11_347"),
    41: new WarningSign("11_346"),
    42: new WarningSign("11_268"),
    43: new WarningSign("11_239"),
    82: new WarningSign("11_319"),
    83: new WarningSign("11_332"),
    84: new WarningSign("11_378"),
    85: new WarningSign("11_348"),
    86: new WarningSign("11_254"),
    87: new WarningSign("11_247"),
    88: new WarningSign("11_381"),
    89: new WarningSign("11_111"),
    90: new WarningSign("11_253"),
    91: new WarningSign("11_238"),
    92: new WarningSign("11_255"),
    93: new WarningSign("11_361"),
    125: new WarningSign("11_363", "Moose"),
    126: new WarningSign("11_363", "Reindeer"),
    127: new WarningSign("11_132"),
    128: new WarningSign("11_132"),
    129: new WarningSign("11_132"),
    130: new WarningSign("11_237"),
    131: new WarningSign("11_236"),
    132: new WarningSign("11_237"),
    133: new WarningSign("11_237"),
    200: new WarningSign("11_379"),
    201: new WarningSign("32_111"),
    202: new WarningSign("11_269"),
    203: new WarningSign("11_256"),
    204: new WarningSign("11_257"),
    205: new WarningSign("11_245"),
    206: new WarningSign("21_194"),
    207: new WarningSign("11_363", "Wild animals"),
    208: new WarningSign("11_132"),
    209: new WarningSign("11_149"),
    210: new WarningSign("11_999"), // No corresponding road sign -> use "Other danger" sign
    211: new WarningSign("11_999"), // No corresponding road sign -> use "Other danger" sign
    212: new WarningSign("11_999"), // No corresponding road sign -> use "Other danger" sign
    213: new WarningSign("11_362")
};
