import S3 from 'aws-sdk/clients/s3';
const s3 = new S3;

export async function getSignedUrl(dataSetID: string): Promise<string> {
    if (!process.env.S3_BUCKET){
        throw new Error("No datasource available.");
    }
    const params: any = {
        Bucket: process.env.S3_BUCKET,
        Key: `${dataSetID}.xml`,
        Expires: 3600 // seconds = 1 hour
    };
    try {
        return await s3.getSignedUrlPromise('getObject', params);
    } catch (err) {
        console.error(err);
        throw new Error(`Error generating pre-signed URL for dataset ${dataSetID}`);
    }
}