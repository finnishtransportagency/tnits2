const xml2js = require('xml2js')

const path = "download/readDataSet?dataSetID=";

export class DatasetLister {
    RestDatasetRefList: DatasetRefList

    constructor(objectKeys: string[]) {
        const baseUrl = process.env.READ_DATASET_URL;
        if (!baseUrl) {
            console.error(`Missing required baseUrl`);
        }
        this.RestDatasetRefList = {
            $: {
                'xmlns':        'http://www.ptvag.com/tnits/dataexchange/rest',
                'xmlns:xsi':    'http://www.w3.org/2001/XMLSchema-instance',
                'xmlns:xlink':  'http://www.w3.org/1999/xlink',
                'xsi:schemaLocation': `http://www.ptvag.com/tnits/dataexchange/rest ${baseUrl}schemas/api/TN-ITS.xsd`
            },
            RestDatasetRef: []
        };
        for (const key of objectKeys) {
            const ref = { $: { 'xlink:href': `${baseUrl}${path}${key}` } };
            this.RestDatasetRefList.RestDatasetRef.push(ref);
        }
    }

    datasetRefListAsXml(): string  {
        const options = {
            headless: true
        };
        const builder = new xml2js.Builder(options);
        return builder.buildObject(this)
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