import { CIDR, IPV4Address } from "../models/3-internet-layer/ip";
import { ICMPProtocol } from "../network/3-internet-layer/icmp";
import { Ipv4Protocol } from "../network/3-internet-layer/ipv4";
import { EthernetNIC } from "../network/4-link-layer/ethernet";
import { Link } from "../network/4-link-layer/link";

export interface IPConfigurationMap {
    [macAddr: string]: IPConfiguration
}

interface IPConfiguration {
    ipAllocation: StaticAllocation | DynamicAllocation,
    link: Link
}

export enum AllocationTypes {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC"
}

export interface StaticAllocation {
    allocationType: AllocationTypes.STATIC,
    ipv4Address: string,
    cidr: { prefix: string, mask: number },
    defaultGateway: string
}

export interface DynamicAllocation {
    allocationType: AllocationTypes.DYNAMIC
}

interface NetworkingStack {
    nic: EthernetNIC,
    ipv4: Ipv4Protocol,
    icmp: ICMPProtocol
}

export class Ipv4OverEthernet {

    private readonly stacks = new Map<string, NetworkingStack>();

    constructor(ipConfig: IPConfigurationMap) {
        for (const mac of Object.keys(ipConfig)) {
            this.stacks.set(mac, this.buildNetworkingStack(mac, ipConfig[mac]));
        }
    }

    private findInterface(ipv4Addr: string): NetworkingStack {
        return null;
    }

    private buildNetworkingStack(mac: string, ipConfig: IPConfiguration): NetworkingStack {
        const hwAddr = parseMacAddr(mac);
        const nic = new EthernetNIC(hwAddr, ipConfig.link);

        let protocolAddr: IPV4Address = null;

        const ipAlloc = ipConfig.ipAllocation;
        if (ipAlloc.allocationType === AllocationTypes.STATIC) {
            protocolAddr = parseIpv4Addr(ipAlloc.ipv4Address);
        }
        else {
            protocolAddr = Buffer.from([0, 0, 0, 0]);
        }

        const ipv4 = new Ipv4Protocol(nic, protocolAddr);
        const icmp = new ICMPProtocol(ipv4, 1);

        return { nic, ipv4, icmp }
    }

    async ping(ipv4Addr: string, payload?: string) {
        const iface = this.findInterface(ipv4Addr);

        await iface.icmp.echo_request(parseIpv4Addr(ipv4Addr), payload);
    }

    arp_cache(): {ip: string, hwaddr: string}[] {
        return Array.from(this.stacks.values())
            .flatMap(stack => Array.from(stack.ipv4.get_arp_cache()))
            .map(([ip, mac]) => ({ ip, hwaddr: mac.toString() }));
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