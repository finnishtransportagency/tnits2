import {
    CompletedPart, CompleteMultipartUploadCommand,
    CompleteMultipartUploadCommandInput,
    CompleteMultipartUploadCommandOutput, CreateMultipartUploadCommand, PutObjectCommand,
    PutObjectCommandInput,
    PutObjectCommandOutput,
    S3Client, UploadPartCommand,
    UploadPartCommandInput,
} from "@aws-sdk/client-s3";
const s3Client = new S3Client({region: process.env.AWS_REGION});

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

async function uploadObjectToS3(s3Bucket: string, objectKey: string, data: string): Promise<PutObjectCommandOutput> {
    const params: PutObjectCommandInput = {
        Bucket: s3Bucket,
        Key: objectKey,
        Body: data,
        ContentType: 'application/xml'
    };
    try {
        const command = new PutObjectCommand(params)
        return await s3Client.send(command);
    }
    catch (err) {
        console.error(err)
        throw new Error('Error uploading object to S3')
    }
}

async function multiPartUploadObjectToS3(s3Bucket: string, objectKey: string, data: string): Promise<PutObjectCommandOutput> {
    const chunks = dataToChunks(data);
    const uploadId = await createMultiPartUpload(s3Bucket, objectKey);
    const completedParts: Array<CompletedPart> = [];
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
    try {
        const command = new CreateMultipartUploadCommand(params)
        const { UploadId } = await s3Client.send(command);
        if (UploadId) return UploadId;
        else throw new Error("Unable to form upload id")
    }
    catch (err) {
        console.error(err)
        throw new Error("Error creating MultiPart upload")
    }
}

async function uploadPart(s3Bucket: string, uploadId: string, objectKey: string, data: Buffer,
                          partNr: number, retry: number = 0): Promise<CompletedPart> {
    const params: UploadPartCommandInput = {
        Bucket: s3Bucket,
        UploadId: uploadId,
        Key: objectKey,
        PartNumber: partNr,
        Body: data
    };
    try {
        const command = new UploadPartCommand(params)
        const { ETag } = await s3Client.send(command)
        if (ETag) return { ETag: ETag, PartNumber: partNr };
        else if (retry < 3) {
            return uploadPart(s3Bucket, uploadId, objectKey, data, partNr, retry + 1);
        } else throw new Error("Unable to upload part");
    }
    catch (err) {
        console.error(err)
        throw new Error("Error uploading part")
    }
}

async function completeMultiPartUpload(s3Bucket: string, uploadId: string, objectKey: string, partList: Array<CompletedPart>): Promise<CompleteMultipartUploadCommandOutput> {
    const params: CompleteMultipartUploadCommandInput = {
        Bucket: s3Bucket,
        Key: objectKey,
        MultipartUpload: {Parts: partList},
        UploadId: uploadId
    }
    try {
        const command = new CompleteMultipartUploadCommand(params)
        return await s3Client.send(command);
    }
    catch (err) {
        console.error(err)
        throw new Error("Error completing MultiPart upload")
    }
}