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