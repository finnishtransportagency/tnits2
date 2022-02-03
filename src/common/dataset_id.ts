import ByteBuffer from 'bytebuffer';
import { parse, stringify } from 'uuid';

export const LiikennevirastoUUID = 'f90056dc-8945-4885-9860-f0f017855cfd';

export const DatasetIDGenerator = {
    encode(provider: string, startTime: number, endTime: number): string {
        const byteBuffer = ByteBuffer.allocate(32);
        byteBuffer.append(new Uint8Array(parse(provider)));
        byteBuffer.writeLong(startTime);
        byteBuffer.writeLong(endTime);
        byteBuffer.offset = 0;
        return byteBuffer.toBase64();
    },
    decode(id: string): DatasetID {
        const buffer = ByteBuffer.fromBase64(id);
        const provider = buffer.slice(0, 16);
        const providerUUID = stringify(Uint8Array.from(provider.buffer));
        buffer.offset = 16;
        const startTime = parseFloat(buffer.readUint64().toString());
        const endTime = parseFloat(buffer.readUint64().toString());
        return new DatasetID(id, providerUUID, startTime, endTime);
    }
}

export class DatasetID {
    encodedId: string;
    providerId: string;
    startTime: number;
    endTime: number;

    constructor(encoded: string, provider: string, startTime: number, endTime:number) {
        this.encodedId = encoded;
        this.providerId = provider;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}