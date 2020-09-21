import { MACAddress } from "../network/link-layer/network-interface";
import { isEqual } from "../util/byte-util";
import { serialize, deserialize, ByteField, FieldDefinition, FieldType } from "../util/fixed-width-util";

export interface Ethernet {
    preamble: Uint8Array
    startFrameDelimiter: number,
    macDestination: MACAddress,
    macSource: MACAddress,
    payloadLength: number,
    payload: Uint8Array,
    frameCheckSequence: FrameCheckSequence,
    idleGap: Uint8Array
}

export class EthernetPacket {

    static toWireFormat(obj: Ethernet): Uint8Array {
        return serialize(obj, PACKET_DEFINITION);
    }

    static toModel(data: Uint8Array): Ethernet {
        return deserialize(data, PACKET_DEFINITION);
    }
}

export const PACKET_DEFINITION: FieldDefinition[] = [
    new ByteField("preamble", 7),
    {
        name: "startFrameDelimiter",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "macDestination",
        fieldType: FieldType.BYTES,
        widthBytes: 6
    },
    {
        name: "macSource",
        fieldType: FieldType.BYTES,
        widthBytes: 6
    },
    { // TODO: implement 802.1Q, 802.1ad, Jumbo frames
        name: "payloadLength",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    {
        name: "payload",
        fieldType: FieldType.BYTES,
        widthBytes: "calculated",
        widthField: "payloadLength"
    },
    {
        name: "frameCheckSequence",
        fieldType: FieldType.BYTES,
        widthBytes: 4
    },
    {
        name: "idleGap",
        fieldType: FieldType.BYTES,
        widthBytes: 12
    }
]

export type FrameCheckSequence = Uint8Array;

const PREAMBLE: Uint8Array = new Uint8Array(Array(7).fill(0xAA));
const START_FRAME_DELIMITER = 0xAB;
const IDLE_FRAME_GAP = new Uint8Array(Array(12).fill(0x00))


function isMACBroadcast(addr: MACAddress) {
    return isEqual(addr, new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
}

function isMACMulticast(addr: MACAddress) {
    return (addr[0] & 0b10000000) == 1;
}

export default {
    isMACBroadcast,
    isMACMulticast,
    PACKET_DEFINITION,
    PREAMBLE,
    START_FRAME_DELIMITER,
    IDLE_FRAME_GAP
}