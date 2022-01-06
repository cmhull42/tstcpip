import { FieldDefinition, FieldType } from "../../util/fixed-width-util";
import { Packet } from "../packet";

export interface UDP {
  sourcePort: number,
  destPort: number,
  length: number,
  checksum: Uint8Array,
}

export const UDP_PACKET_DEF: FieldDefinition[] = [
  {
    name: "sourcePort",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 2
  },
  {
    name: "destPort",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 2
  },
  {
    name: "length",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 2
  },
  {
    name: "checksum",
    fieldType: FieldType.BYTES,
    widthBytes: 2
  }
]

export const UDPPacket = new Packet<UDP>(UDP_PACKET_DEF);