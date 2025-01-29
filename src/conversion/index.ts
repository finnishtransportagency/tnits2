import { ScheduledEvent } from 'aws-lambda';
import { uploadToS3 } from './s3-storage/upload_handler';
import { DatasetIDGenerator, LiikennevirastoUUID } from '../common/dataset_id';
import { TnItsConverter } from './tn-its/tnits_converter';
import { getNewStartTime } from '../common/s3_list_objects';
import { fetchAllChanges } from './changes/change-requester';

export const handler = async ( event: ScheduledEvent ) => {
    try {
        const dataset = await generateXmlDataSet();
        console.log(`Successfully generated dataset ${dataset} at ${new Date()}.`);
    } catch (err) {
        console.error(err);
        throw new Error(`Error in generating dataset.`);
    }
}

/**
 * Generates and saves Tn-Its xml files from changes
 */
 async function generateXmlDataSet(): Promise<string> {
    const startTime = await getNewStartTime(process.env.S3_BUCKET_VALID);
    const endTime = new Date('2025-01-24T23:59:59');
    endTime.setMinutes(endTime.getMinutes() - 1);

    const datasetID = DatasetIDGenerator.encode(LiikennevirastoUUID, startTime.getTime(), endTime.getTime());
    const changes = await fetchAllChanges(startTime.toISOString(), endTime.toISOString());
    const conversion = new TnItsConverter(changes, datasetID, endTime.toISOString());
    const tnItsXml = conversion.datasetAsXML();
    await uploadToS3(datasetID, tnItsXml);

    return datasetID;
}