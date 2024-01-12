import {Readable} from "stream";

export async function streamToString(stream: Readable): Promise<string> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}