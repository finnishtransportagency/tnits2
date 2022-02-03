import S3, { CopyObjectRequest, DeleteObjectRequest, GetObjectRequest, GetObjectOutput } from 'aws-sdk/clients/s3';
const s3 = new S3;

export async function fetchObject(dataSetID: string): Promise<GetObjectOutput> {
    if (!process.env.S3_BUCKET_INCOMING){
        throw new Error("No datasource available.");
    }
    const params: GetObjectRequest = {
        Bucket: process.env.S3_BUCKET_INCOMING,
        Key: dataSetID
    };
    try {
        return await s3.getObject(params).promise();
    } catch (err) {
        console.error(err);
        throw new Error(`Error getting object ${dataSetID} from bucket ${params.Bucket}`);
    }
}

export async function moveObject(key: string, dataSet: GetObjectOutput): Promise<string> {
    if (dataSet.ContentLength && dataSet.ContentLength > 5368706371) {
        throw new Error(`Not able to relocate file. File size (${ dataSet.ContentLength }) exceeds allowed 5 Gb.`);
    }
    if (!process.env.S3_BUCKET_INCOMING || ! process.env.S3_BUCKET_VALID) {
        throw new Error("Incoming or outgoing s3 bucket not specified");
    }
    const oldBucket = process.env.S3_BUCKET_INCOMING;
    const newBucket = process.env.S3_BUCKET_VALID;
    try {
        await copyObject(oldBucket, newBucket, key);
        await deleteObject(oldBucket, key);
        console.log(`Successfully moved object from bucket ${oldBucket} to ${newBucket}`);
        return key;
    } catch (err) {
        console.error(err);
        throw new Error(`Error copying or deleting object ${key} from s3 bucket ${oldBucket} to ${newBucket}.`);
    }
}

async function copyObject(oldBucket: string, newBucket: string, key: string) {
    const copySource = `/${oldBucket}/${key}`;
    const copyParams: CopyObjectRequest = {
        Bucket: newBucket,
        CopySource: encodeURIComponent(copySource),
        Key: key
    };
    return await s3.copyObject(copyParams).promise();
}

async function deleteObject(bucket: string, key: string) {
    const deleteParams: DeleteObjectRequest = {
        Bucket: bucket,
        Key: key
    }
    return await s3.deleteObject(deleteParams).promise();
}