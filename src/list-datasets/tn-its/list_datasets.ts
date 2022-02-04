import { j2xParser as Parser } from "fast-xml-parser";

const path = "/download/readDataSet?dataSetID=";

export class DatasetLister {
    RestDatasetRefList: DatasetRefList

    constructor(objectKeys: string[]) {
        this.RestDatasetRefList = {
            $: {
                'xmlns':        'http://spec.tn-its.eu/api/',
                'xmlns:xsi':    'http://www.w3.org/2001/XMLSchema-instance',
                'xmlns:xlink':  'http://www.w3.org/1999/xlink'
            },
            RestDatasetRef: []
        };
        const baseUrl = process.env.READ_DATASET_URL;
        if (!baseUrl) {
            console.error(`Cannot form reference url without baseUrl`);
        } else {
            for (const key of objectKeys) {
                const ref = { $: { 'xlink:href': `${baseUrl}${path}${key}` } };
                this.RestDatasetRefList.RestDatasetRef.push(ref);
            }
        }
    }

    datasetRefListAsXml(): string  {
        const options = {
            attrNodeName: "$",
            textNodeName: "_text",
            supressEmptyNode: true
        };
        const parser = new Parser(options);
        return parser.parse(this);
    }
}

interface DatasetRefList {
    $: ReferenceAttributes;
    RestDatasetRef: Array<DatasetRef>
}

interface DatasetRef {
    $: ReferenceAttributes;
}

interface ReferenceAttributes {
    [ key: string ]: string
}