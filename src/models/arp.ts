import { ByteField, FieldDefinition, FieldType } from "../util/fixed-width-util";

export interface ARPPacket {
    hardwareType: Uint8Array;
    protocolType: Uint8Array;
    hardwareAddrLength: number;
    protocolAddrLength: number;
    operation: number;
    senderHardwareAddr: Uint8Array
    senderProtocolAddr: Uint8Array
    targetHardwareAddr: Uint8Array
    targetProtocolAddr: Uint8Array
}

export const ARP_PACKET_DEFINITION: FieldDefinition[] = [
    new ByteField("hardwareType", 2),
    new ByteField("protocolType", 2),
    {
        name: "hardwareAddrLength",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "protocolAddrLength",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "operation",
        fieldType: FieldType.UNSIGNED_NUMBER,
        widthBytes: 2
    },
    new ByteField(
        "senderHardwareAddr", 
        "calculated", 
        "hardwareAddrLength"
    ),
    new ByteField(
        "senderProtocolAddr",
        "calculated",
        "protocolAddrLength"
    ),
    new ByteField(
        "targetHardwareAddr",
        "calculated",
        "hardwareAddrLength"
    ),
    new ByteField(
        "protocolHardwareAddr",
        "calculated",
        "protocolAddrLength"
    )
]