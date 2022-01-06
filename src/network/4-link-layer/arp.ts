import { ARP, ARPPacket, ARP_OPERATION } from "../../models/4-link-layer/arp";
import * as ip from "../../models/3-internet-layer/ip";
import { isEqual } from "../../util/byte-util";
import { MACAddress, NIC, NICType } from "./network-interface";


export class ArpService {
    hardwareType: Uint8Array;
    protocolType = new Uint8Array([0x08, 0x00]);
    protocolAddr: ip.IPV4Address | Promise<ip.IPV4Address>;
    nic: NIC;
    ARP_PROTOCOL_SPECIFIER = 0x0806;
    requestQueue = new Map<string, (model: ARP) => void>()

    constructor(nic: NIC, protocolAddress: ip.IPV4Address | Promise<ip.IPV4Address>) {
        this.nic = nic;
        this.protocolAddr = protocolAddress;
        this.hardwareType = this.getHardwareType(this.nic.nicType);
        this.nic.register(this.ARP_PROTOCOL_SPECIFIER, this.receive.bind(this));
    }


    private getHardwareType(nicType: NICType) {
        switch(nicType) {
            case NICType.ETHERNET:
                return new Uint8Array([0x00, 0x01]);
        }
    }

    public async probe(desiredAddress: ip.IPV4Address): Promise<boolean> {
        const protocolAddr = await this.protocolAddr;
        try {
            await this.send_request(
                desiredAddress, 
                new Uint8Array(Array(protocolAddr.byteLength).fill(0x00)),
                5000
            );
            return false;
        } catch (e) {
            // no response within timeout - can use desiredAddress
            return true;
        }
    }

    public async announce(address: ip.IPV4Address) {
        const protocolAddr = await this.protocolAddr;

        const model: ARP = {
            hardwareType: this.hardwareType,
            protocolType: this.protocolType,
            protocolAddrLength: protocolAddr.byteLength,
            hardwareAddrLength: this.nic.hardwareAddr.byteLength,
            operation: ARP_OPERATION.REQUEST,
            senderHardwareAddr: this.nic.hardwareAddr,
            senderProtocolAddr: address,
            targetHardwareAddr: new Uint8Array(Array(this.nic.hardwareAddr.byteLength).fill(0x00)),
            targetProtocolAddr: address
        };

        this.nic.broadcast(ARPPacket.toWireFormat(model), this.ARP_PROTOCOL_SPECIFIER);
    }

    private async send_request(target: ip.IPV4Address, sender: ip.IPV4Address, timeout: number): Promise<ARP> {
        const protocolAddr = await this.protocolAddr;

        const model: ARP = {
            hardwareType: this.hardwareType,
            protocolType: this.protocolType,
            protocolAddrLength: protocolAddr.byteLength,
            hardwareAddrLength: this.nic.hardwareAddr.byteLength,
            operation: ARP_OPERATION.REQUEST,
            senderHardwareAddr: this.nic.hardwareAddr,
            senderProtocolAddr: sender,
            targetHardwareAddr: new Uint8Array(Array(this.nic.hardwareAddr.byteLength).fill(0x00)),
            targetProtocolAddr: target
        };
        const waiter = new Promise<ARP>((res, rej) => {
            this.requestQueue.set(ip.toString(target), res);
            setTimeout(() => rej(), timeout);
        });

        this.nic.broadcast(ARPPacket.toWireFormat(model), this.ARP_PROTOCOL_SPECIFIER);

        return waiter;
    }

    public async request(target: ip.IPV4Address): Promise<MACAddress> {
        const protocolAddr = await this.protocolAddr;

        const reply = await this.send_request(target, protocolAddr, 5000);
        return reply.senderHardwareAddr;
    }

    public async reply(targetProtocolAddr: ip.IPV4Address, targetHardwareAddr: Uint8Array) {
        const protocolAddr = await this.protocolAddr;

        const model: ARP = {
            hardwareType: this.hardwareType,
            protocolType: this.protocolType,
            protocolAddrLength: protocolAddr.byteLength,
            hardwareAddrLength: this.nic.hardwareAddr.byteLength,
            operation: ARP_OPERATION.REPLY,
            senderHardwareAddr: this.nic.hardwareAddr,
            senderProtocolAddr: protocolAddr,
            targetHardwareAddr: targetHardwareAddr,
            targetProtocolAddr: targetProtocolAddr
        };

        this.nic.send(targetHardwareAddr, ARPPacket.toWireFormat(model), this.ARP_PROTOCOL_SPECIFIER);
    }

    public async receive(payload: Uint8Array) {
        const model = ARPPacket.toModel(payload);
        switch(model.operation) {
            case ARP_OPERATION.REPLY:
                const callback = this.requestQueue.get(
                    ip.toString(model.senderProtocolAddr)
                );
                if (callback) {
                    callback(model);
                }
                return;
            case ARP_OPERATION.REQUEST:
                if (isEqual(model.targetProtocolAddr, this.protocolAddr)) {
                    this.reply(model.senderProtocolAddr, model.senderHardwareAddr);
                }
        } 
    }
}