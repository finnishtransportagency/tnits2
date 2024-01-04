import {
    GetObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
    S3Client,
    GetObjectCommandOutput,
    GetObjectCommandInput,
    CopyObjectCommandInput,
    DeleteObjectCommandInput
} from "@aws-sdk/client-s3";
const s3Client = new S3Client({region: process.env.AWS_REGION});

export async function fetchObject(dataSetID: string): Promise<GetObjectCommandOutput> {
    if (!process.env.S3_BUCKET_INCOMING){
        throw new Error("No datasource available.");
    }
    const params: GetObjectCommandInput = {
        Bucket: process.env.S3_BUCKET_INCOMING,
        Key: dataSetID
    };
    try {
        const command: GetObjectCommand = new GetObjectCommand(params)
        return await s3Client.send(command);
    } catch (err) {
        console.error(err);
        throw new Error(`Error getting object ${dataSetID} from bucket ${params.Bucket}`);
    }
}

export async function moveObject(key: string, dataSet: GetObjectCommandOutput): Promise<string> {
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
    const copyParams: CopyObjectCommandInput = {
        Bucket: newBucket,
        CopySource: encodeURIComponent(copySource),
        Key: key
    };
    const command = new CopyObjectCommand(copyParams)
    return await s3Client.send(command);
}

async function deleteObject(bucket: string, key: string) {
    const deleteParams: DeleteObjectCommandInput = {
        Bucket: bucket,
        Key: key
    }
    const command = new DeleteObjectCommand(deleteParams)
    return await s3Client.send(command);
}