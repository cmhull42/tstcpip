import { FieldDefinition, FieldType } from "../../util/fixed-width-util";
import { Packet } from "../packet";

export interface DHCP {
  op: number;
  htype: number;
  hlen: number;
  hops: number;
  xid: number;
  secs: number;
  flags: Uint8Array;
  ciaddr: Uint8Array;
  yiaddr: Uint8Array;
  siaddr: Uint8Array;
  giaddr: Uint8Array;
  chaddr: Uint8Array;
  padding: Uint8Array;
  cookie: Uint8Array;
}

export const DHCPDISCOVER_PACKET_DEF: FieldDefinition[] = [
  {
    name: "op",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 1,
  },
  {
    name: "htype",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 1
  },
  {
    name: "hlen",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 1
  },
  {
    name: "hops",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 1
  },
  {
    name: "xid",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 4
  },
  {
    name: "secs",
    fieldType: FieldType.UNSIGNED_NUMBER,
    widthBytes: 2
  },
  {
    name: "flags",
    fieldType: FieldType.BYTES,
    widthBytes: 2
  },
  {
    name: "ciaddr",
    fieldType: FieldType.BYTES,
    widthBytes: 4
  },
  {
    name: "yiaddr",
    fieldType: FieldType.BYTES,
    widthBytes: 4
  },
  {
    name: "siaddr",
    fieldType: FieldType.BYTES,
    widthBytes: 4
  },
  {
    name: "giaddr",
    fieldType: FieldType.BYTES,
    widthBytes: 4
  },
  {
    name: "chaddr",
    fieldType: FieldType.BYTES,
    widthBytes: 8
  },
  {
    name: "padding",
    fieldType: FieldType.BYTES,
    widthBytes: 192
  },
  {
    name: "cookie",
    fieldType: FieldType.BYTES,
    widthBytes: 4
  }
]

export const DhcpPacket = new Packet<DHCP>(DHCPDISCOVER_PACKET_DEF);