import { parse } from "path";
import { Ipv4Protocol } from "../network/internet-layer/ipv4";
import { EthernetNIC } from "../network/link-layer/ethernet";
import { Link } from "../network/link-layer/link";

export class Ipv4OverEthernet {
    port1: Link;
    macAddr: Uint8Array;
    ipv4Addr: Uint8Array;
    nic: EthernetNIC;
    ipv4: Ipv4Protocol;

    constructor(port1: Link, macAddr: string, ipv4Addr: string) {
        this.port1 = port1;
        this.macAddr = parseMacAddr(macAddr);
        this.ipv4Addr = parseIpv4Addr(ipv4Addr);

        this.nic = new EthernetNIC(this.macAddr, this.port1);
        this.ipv4 = new Ipv4Protocol(this.nic, this.ipv4Addr);
    }
}

function parseMacAddr(mac: string): Uint8Array {
    const octets = mac.split(':');
    return new Uint8Array(octets.map((o) => Buffer.from(o, 'hex')[0]));
}

function parseIpv4Addr(addr: string): Uint8Array {
    const octets = addr.split(".");
    return new Uint8Array(octets.map((o) => parseInt(o, 10)));
}