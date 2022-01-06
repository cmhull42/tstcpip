import { bytesToUnsignedNumber } from "../../util/byte-util";
import { FieldDefinition, FieldType } from "../../util/fixed-width-util";
import { Packet } from "../packet";

export type ProtocolAddress = Uint8Array;
export type IPV4Address = ProtocolAddress;
export type IPV6Address = ProtocolAddress;

export interface IPV4 {
    versionIHL: number;
    dscpECN: number;
    totalLength: number;
    identification: number;
    flagsFragmentOffset: number;
    ttl: number;
    protocol: number;
    headerChecksum: Uint8Array;
    sourceIPAddr: IPV4Address;
    destIPAddr: IPV4Address;
}

export function toString(address: IPV4Address) {
    return address.join(".");
}

export const IPV4_HEADER_PACKET_DEFINITION: FieldDefinition[] = [
    {
        name: "versionIHL",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1,
    },
    {
        name: "dscpECN",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "totalLength",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    {
        name: "identification",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    {
        name: "flagsFragmentOffset",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    {
        name: "ttl",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "protocol",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "headerChecksum",
        fieldType: FieldType.BYTES,
        widthBytes: 2
    },
    {
        name: "sourceIPAddr",
        fieldType: FieldType.BYTES,
        widthBytes: 4
    },
    {
        name: "destIPAddr",
        fieldType: FieldType.BYTES,
        widthBytes: 4
    }
    // all my homies hate OPTIONS
]

class _IPV4Packet extends Packet<IPV4> {

    constructor() {
        super(IPV4_HEADER_PACKET_DEFINITION);
    }
}

export const IPV4Header = new _IPV4Packet();

export function calculateChecksum(data: Uint8Array) {
    let checksum = 0
    for (let i=0; i < data.byteLength / 2; i++) {
        const offset = i * 2;
        const word = data.slice(offset, offset + 2)
        const res = checksum + bytesToUnsignedNumber(word);

        checksum = (res & 0b01111111111111111) + (res >> 16);
    }

    return ((~checksum) & 0x000000000000FFFF) >>> 0;
}

export interface CIDR {
    prefix: IPV4Address,
    mask: number
}

export const BROADCAST_ADDRESS: IPV4Address = Buffer.from([255, 255, 255, 255])