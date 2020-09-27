import { EtherType } from "../../models/link-layer/ethernet";
import * as ip from "../../models/internet-layer/ip";
import { unsignedNumberToBytes } from "../../util/byte-util";
import { ArpService } from "../link-layer/arp";
import { MACAddress, NIC } from "../link-layer/network-interface";
import { getDatagramId } from "./datagram-id";

export class Ipv4Protocol {
    private nic: NIC;
    private ipv4Addr: ip.IPV4Address;
    private arpCache = new Map<string, MACAddress>();
    private arpService: ArpService;
    private registry = new Map<number, Interceptor>();
    private waitPool = new Map<string, ((resp: Uint8Array) => void)>();

    constructor(nic: NIC, ipv4Addr: ip.IPV4Address) {
        this.nic = nic;
        this.ipv4Addr = ipv4Addr;
        this.arpService = new ArpService(this.nic, ipv4Addr);

        this.nic.register(EtherType.IPV4, this.receive.bind(this));
    }

    public async send(destinationAddress: ip.IPV4Address, protocol: number, payload: Uint8Array, ttl: number): Promise<void> {
        let destHardwareAddr = this.arpCache.get(ip.toString(destinationAddress));
        if (!destHardwareAddr) {
            try {
                destHardwareAddr = await this.arpService.request(destinationAddress);
            }
            catch (err) {
                throw new Error("NOSUCHADDRESS");
            }
        }

        const datagramId = getDatagramId(this.ipv4Addr, destinationAddress, protocol);
        const model: ip.IPV4 = {
            // 0100-> ipv4 version 0101 -> header size
            versionIHL: 0b01000101,
            // 000000 -> default dscp class, 00 -> no ECN
            dscpECN: 0b00000000,
            totalLength: ip.IPV4Header.getWidth() + payload.byteLength,
            identification: datagramId,
            // 000 -> reserve, DF, MF, 0000000000000 -> frag offset
            // TODO implement fragmenting
            flagsFragmentOffset: 0b0000000000000000,
            ttl: ttl,
            protocol: protocol,
            headerChecksum: new Uint8Array([0x00, 0x00]),
            sourceIPAddr: this.ipv4Addr,
            destIPAddr: destinationAddress
        };

        const header = ip.IPV4Header.toWireFormat(model);
        const checksum = ip.IPV4Header.calculateChecksum(header);
        header.set(unsignedNumberToBytes(checksum, 2), 10);

        const wire = Buffer.alloc(model.totalLength);
        wire.set(header);
        wire.set(payload, ip.IPV4Header.getWidth());

        this.nic.send(destHardwareAddr, wire, EtherType.IPV4);
    }

    public register(protocol: number, interceptor: Interceptor) {
        if (this.registry.has(protocol)) {
            throw new Error(`Already bound protocol ${protocol}`);
        }

        this.registry.set(protocol, interceptor);
    }

    private getWaitFor(localAddr: ip.IPV4Address, remoteAddr: ip.IPV4Address, protocol) {
        return this.waitPool.get(`${ip.toString(remoteAddr)}-${ip.toString(localAddr)}-${protocol}`);
    }

    private putWaitFor(localAddr: ip.IPV4Address, remoteAddr: ip.IPV4Address, protocol, callback: (payload: Uint8Array) => void) {
        return this.waitPool.set(`${ip.toString(remoteAddr)}-${ip.toString(localAddr)}-${protocol}`, callback);
    }

    private receive(packet: Uint8Array) {
        const header = ip.IPV4Header.toModel(packet);
        const headerWidth = ip.IPV4Header.getWidth();
        const payload = packet.slice(headerWidth);

        const checksum = ip.IPV4Header.calculateChecksum(packet.slice(0, headerWidth));
        if (checksum != 0) {
            return;
        }

        const interceptor = this.registry.get(header.protocol);
        if (interceptor) {
            interceptor(payload);
        }
    }
}

export type Interceptor = (payload: Uint8Array) => any;