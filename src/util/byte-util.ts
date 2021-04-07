export function isEqual(bytes1: Uint8Array, bytes2: Uint8Array) {
    const view1 = Buffer.from(bytes1);
    const view2 = Buffer.from(bytes2);

    if  (view1.byteLength != view2.byteLength) {
        return false;
    }

    for (let i=0; i < view1.byteLength; i++) {
        if (view1.readUInt8(i) !== view2.readUInt8(i)) {
            return false;
        }
    }

    return true;
}

export function bytesToUnsignedNumber(data: Uint8Array): number {
    const buffer = Buffer.from(data);
    switch (data.byteLength) {
        case 1:
            return buffer.readUInt8();
        case 2:
            return buffer.readUInt16BE();
        case 4:
            return buffer.readUInt32BE();
    }
}

export function unsignedNumberToBytes(num: number, width: number): Uint8Array {
    const buff = Buffer.alloc(width);

    switch (width) {
        case 1:
            buff.writeUInt8(num);
            return buff
        case 2:
            buff.writeUInt16BE(num);
            return buff;
        case 4:
            buff.writeUInt32BE(num);
            return buff;
    }
}

export function hashCode(obj: string) {
    var hash = 0;
    for (var i = 0; i < obj.length; i++) {
        var character = obj.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}