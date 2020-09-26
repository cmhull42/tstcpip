import { Connectable, Link } from "./link"

export interface NIC extends Connectable {
    link: Link;
    hardwareAddr: MACAddress;

    send: (destination: MACAddress, payload: Payload, protocol: number) => void;
    broadcast: (payload: Payload, protocol: number) => void;
    receive: (payload: Payload) => void;
    register: (protocol: number, interrupt: PacketInterrupt) => void;
}

export type PacketInterrupt = (payload: Payload) => void;

export type Payload = Uint8Array
export type MACAddress = Uint8Array