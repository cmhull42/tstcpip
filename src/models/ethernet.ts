import { MACAddress } from "../network/link-layer/network-interface";
import { isEqual } from "../util/byte-util";
import { ByteField, FieldDefinition, FieldType } from "../util/fixed-width-util";
import { Packet } from "./packet";

export interface Ethernet {
    preamble: Uint8Array
    startFrameDelimiter: number,
    macDestination: MACAddress,
    macSource: MACAddress,
    etherType: EtherType
}

export enum EtherType {
    IPV4 = 0x0800,
    ARP = 0x0806,
    VLAN_TAG = 0x8100,
    IPV6 = 0x86DD
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
    {
        name: "etherType",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    }
]
class _EthernetPacket extends Packet<Ethernet> {
    getWidth() {
        return this.definition.reduce((prev, curr) =>
                prev + (curr.widthBytes as number)
        , 0)
    }
}

export const EthernetHeader = new _EthernetPacket(PACKET_DEFINITION);

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