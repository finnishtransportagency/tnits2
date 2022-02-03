import { S3Event, S3EventRecord } from 'aws-lambda';
import { fetchObject, moveObject } from './s3-storage/object_handler';
import { validate } from './validator/xml_validator';

export const handler = async ( event: S3Event ) => {
    const record = event.Records[0];
    const message = await validateDataset(record);
    console.log(message);
    return message;
}

async function validateDataset(record: S3EventRecord): Promise<string> {
    const dataSetID = decodeURIComponent(record.s3.object.key);
    const dataSet = await fetchObject(dataSetID);
    const dataSetString = dataSet.Body ? dataSet.Body.toString() : '';
    try {
        validate(dataSetString, dataSetID);
        const newKey = await moveObject(dataSetID, dataSet);
        return `Successfully validated and moved dataset: ${newKey}`;
    } catch (err) {
        console.error(err);
        return `Error happended during validation process.`;
    }
}