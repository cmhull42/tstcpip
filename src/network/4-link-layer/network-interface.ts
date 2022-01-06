import { Link } from "./link"

export interface NIC {
    nicType: NICType;
    link: Link;
    hardwareAddr: MACAddress;

    send: (destination: MACAddress, payload: Payload, protocol: number) => void;
    broadcast: (payload: Payload, protocol: number) => void;
    receive: (payload: Payload) => void;
    register: (protocol: number, interrupt: PacketInterrupt) => void;
}

export enum NICType {
    ETHERNET
}

export type PacketInterrupt = (payload: Payload) => void;

export type Payload = Uint8Array
export class MACAddress extends Uint8Array {
    toString(): string {
        console.log(JSON.stringify(Array.from(this)));
        return Array.from(this)
            .map((digit) => digit.toString(16).padStart(2, '0'))
            .join(':')
    }
}