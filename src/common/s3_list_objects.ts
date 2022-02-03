import S3, { ListObjectsV2Output, ListObjectsV2Request, ObjectList } from 'aws-sdk/clients/s3';
import { DatasetID, DatasetIDGenerator } from './dataset_id';
const s3 = new S3;

/**
 * Get start time to new dataset
 * If there is no datasets in s3 start time is current moment minus 1 day.
 * Otherwise start time is end time of latest dataset.
 * @param bucket    S3 bucket name 
 * @returns         Date
 */
export async function getNewStartTime(bucket?: string): Promise<Date> {
    const sortedDatasetIDs = await listBucketObjects(bucket);
    const latestEndTime = sortedDatasetIDs.pop();
    if (latestEndTime) {
        return new Date(latestEndTime.endTime);
    } else {
        const newTime = new Date();
        newTime.setDate(newTime.getDate() - 1);
        return newTime;
    }
}

/**
 * List of s3 bucket object keys 
 * @param bucket        S3 bucket name
 * @param lastValidId   Id of last valid datasets
 * @returns             Array of strings promise
 */
export async function getBucketObjects(bucket?: string, lastValidId?: string): Promise<string[]> {
    const sortedDatasetIDs = await listBucketObjects(bucket);
    const keys = sortedDatasetIDs.map(obj => encodeURIComponent(obj.encodedId));
    if (lastValidId) {
        const indexOfLast = keys.indexOf(encodeURIComponent(lastValidId));
        return keys.slice(indexOfLast + 1);
    }
    return keys;
}

async function listBucketObjects(bucket?: string): Promise<DatasetID[]> {
    if (!bucket) {
        throw new Error("No datasource available.");
    }
    const params: ListObjectsV2Request = {
        Bucket: bucket
    };
    const s3Objects: ObjectList = await listAllBucketObjects(params);
    const keys: string[] = [];
    s3Objects.forEach(obj => {
        if (obj.Key && obj.Key.endsWith('.xml')) {
            keys.push(obj.Key.replace('.xml', ''));
        }
    });
    return sortByCreateTime(keys);
}

async function listAllBucketObjects(params: ListObjectsV2Request): Promise<ObjectList> {
    const result: ListObjectsV2Output = await s3.listObjectsV2(params).promise();
    if (result.IsTruncated && result.Contents) {
        params.ContinuationToken = result.NextContinuationToken;
        return result.Contents.concat(await listAllBucketObjects(params));
    } else {
        if (result.Contents) return result.Contents;
        else return [];
    }
}

function sortByCreateTime(keys: string[]): Array<DatasetID> {
    const decodedIds = keys.map(key => DatasetIDGenerator.decode(decodeURIComponent(key)));
    return decodedIds.sort((obj1: DatasetID, obj2: DatasetID) => {
        return obj1.endTime - obj2.endTime;
    });
}