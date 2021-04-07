import { FieldDefinition, FieldType } from "../../util/fixed-width-util";
import { Packet } from "../packet";

export enum ICMPType {
    ECHO_REPLY = 0,
    ECHO_REQUEST = 8
}

export interface ICMPHeader {
    type: ICMPType;
    code: number;
    checksum: number;
}

export type ICMPRequestReplyHeader = ICMPHeader & {
    identifier: number;
    sequence: number;
}

const HEADER_PACKET_DEF: FieldDefinition[] = [
    {
        name: "type",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "code",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "checksum",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    }
]

const REQUEST_HEADER_PACKET_DEF: FieldDefinition[] = HEADER_PACKET_DEF.concat([
    {
        name: "identifier",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    {
        name: "sequence",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    }
]);

class _RequestReply extends Packet<ICMPRequestReplyHeader> {
    constructor() {
        super(REQUEST_HEADER_PACKET_DEF);
    }
}

class _Header extends Packet<ICMPHeader> {
    constructor() {
        super(HEADER_PACKET_DEF);
    }
}

export const ICMPRequestReplyHeader = new _RequestReply();
export const ICMPHeader = new _Header();