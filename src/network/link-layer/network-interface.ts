import { Connectable, Link } from "./link"

export interface NIC extends Connectable {
    link: Link;
    mac: MACAddress;

    send: (destination: MACAddress, payload: Payload) => void;
    receive(payload: Payload)
}

export type Payload = Uint8Array
export type MACAddress = Uint8Array