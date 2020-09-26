import { FieldDefinition, FieldType } from "../util/fixed-width-util";
import { Packet } from "./packet";

export type ProtocolAddress = Uint8Array;
export type IPV4Address = ProtocolAddress;
export type IPV6Address = ProtocolAddress;

export interface IPV4 {
    versionIHL: number;
    dscpECN: number;
    totalLength: number;
    identification: Uint8Array;
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
        fieldType: FieldType.BYTES,
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

export const IPV4Packet = new _IPV4Packet();