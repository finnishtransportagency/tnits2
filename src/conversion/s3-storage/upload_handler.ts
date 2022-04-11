import S3, { PutObjectRequest, PutObjectOutput, UploadPartRequest, PartNumber, CompletedPart, CompletedPartList, CompleteMultipartUploadRequest, CompleteMultipartUploadOutput } from 'aws-sdk/clients/s3';
const s3 = new S3;

// Upload files greater than 100 Mb with multipart upload 
const multiPartUploadLimitBytes = 1024 * 1024 * 100;

export async function uploadToS3 (id: string, data: string): Promise<void> {
    if (!process.env.S3_BUCKET) throw new Error("No S3 Bucket available.");

    const startTime = Date.now();
    const s3Bucket = process.env.S3_BUCKET;
    const objectKey = `${encodeURIComponent(id)}.xml`;
    const fileSizeBytes = Buffer.byteLength(data, "utf-8");
    try {
        if (fileSizeBytes <= multiPartUploadLimitBytes) {
            await uploadObjectToS3(s3Bucket, objectKey, data);
        } else {
            console.info("Using multipart upload")
            await multiPartUploadObjectToS3(s3Bucket, objectKey, data)
        }
        const executionTimeSeconds = (Date.now() - startTime) / 1000;
        console.info(`Saving to s3 took ${executionTimeSeconds} seconds`);    
    } catch (err) {
        console.error(err);
        throw new Error(`Error saving object ${objectKey} to ${s3Bucket}.`);
    }
}

async function uploadObjectToS3(s3Bucket: string, objectKey: string, data: string): Promise<PutObjectOutput> {
    const params: PutObjectRequest = {
        Bucket: s3Bucket,
        Key: objectKey,
        Body: data,
        ContentType: 'application/xml'
    };
    return await s3.putObject(params).promise();
}

async function multiPartUploadObjectToS3(s3Bucket: string, objectKey: string, data: string): Promise<PutObjectOutput> {
    const chunks = dataToChunks(data);
    const uploadId = await createMultiPartUpload(s3Bucket, objectKey);
    const completedParts: CompletedPartList = [];
    for (const part of chunks) {
        completedParts.push(await uploadPart(s3Bucket, uploadId, objectKey, part.data, part.partNumber));
        console.info(`Uploaded part ${part.partNumber} / ${chunks.length}`);
    }
    return await completeMultiPartUpload(s3Bucket, uploadId, objectKey, completedParts);
}

/** Split data to parts of max size 5Mb */
function dataToChunks(data: string): Array<{partNumber: number, data: Buffer}> {
    const dataSizeBytes = Buffer.byteLength(data, "utf-8");
    const partSizeBytes = 1024 * 1024 * 5;
    const numberOfParts = Math.ceil(dataSizeBytes / partSizeBytes);
    const buffer = Buffer.from(data, "utf-8");

    const chunks: Array<{partNumber: number, data: Buffer}> = [];
    let start = 0;
    let end = partSizeBytes;

    for (let i = 1; i <= numberOfParts; i++) {
        const chunk = i < numberOfParts ? buffer.slice(start, end) : buffer.slice(start);
        chunks.push({partNumber: i, data: chunk});
        start = end;
        end = start + partSizeBytes;
    }
    return chunks;
}

async function createMultiPartUpload(s3Bucket: string, objectKey: string): Promise<string> {
    const params = {
        Bucket: s3Bucket,
        Key: objectKey
    };
    const { UploadId } = await s3.createMultipartUpload(params).promise();
    if (UploadId) return UploadId;
    else throw new Error("Unable to form upload id")
}

async function uploadPart(s3Bucket: string, uploadId: string, objectKey: string, data: Buffer, 
                          partNr: PartNumber, retry: number = 0): Promise<CompletedPart> {
    const params: UploadPartRequest = {
        Bucket: s3Bucket,
        UploadId: uploadId,
        Key: objectKey,
        PartNumber: partNr,
        Body: data
    };
    const { ETag } = await s3.uploadPart(params).promise()
    if (ETag) return { ETag: ETag, PartNumber: partNr };
    else if (retry < 3) {
        return uploadPart(s3Bucket, uploadId, objectKey, data, partNr, retry + 1);
    } else throw new Error("Unable to upload part");
}

async function completeMultiPartUpload(s3Bucket: string, uploadId: string, objectKey: string, partList: CompletedPartList): Promise<CompleteMultipartUploadOutput> {
    const params: CompleteMultipartUploadRequest = {
        Bucket: s3Bucket,
        Key: objectKey,
        MultipartUpload: { Parts: partList },
        UploadId: uploadId
    }
    return await s3.completeMultipartUpload(params).promise();
}