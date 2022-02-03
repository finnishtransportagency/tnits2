import S3, { PutObjectRequest, PutObjectOutput } from 'aws-sdk/clients/s3';
const s3 = new S3;

export async function uploadToS3 (id: string, data: string): Promise<PutObjectOutput> {
    if (!process.env.S3_BUCKET){
        throw new Error("No S3 Bucket available.");
    }
    const s3Bucket = process.env.S3_BUCKET;
    const objectKey = `${encodeURIComponent(id)}.xml`;
    const params: PutObjectRequest = {
        Bucket: s3Bucket,
        Key: objectKey,
        Body: data,
        ContentType: 'application/xml'
    };
    try {
        return await s3.putObject(params).promise();
    } catch (err) {
        console.error(err);
        throw new Error(`Error saving object ${objectKey} to ${s3Bucket}.`);
    }
}