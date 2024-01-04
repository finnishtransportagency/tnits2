import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
const s3Client = new S3Client({region: process.env.AWS_REGION});

export async function getSignedDatasetUrl(dataSetID: string): Promise<string> {
    if (!process.env.S3_BUCKET){
        throw new Error("No datasource available.");
    }
    const params: any = {
        Bucket: process.env.S3_BUCKET,
        Key: `${dataSetID}.xml`,
        Expires: 3600 // seconds = 1 hour
    };
    try {
        const command = new GetObjectCommand(params)
        return await getSignedUrl(s3Client, command);
    } catch (err) {
        console.error(err);
        throw new Error(`Error generating pre-signed URL for dataset ${dataSetID}`);
    }
}