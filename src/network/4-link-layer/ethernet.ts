import { crc32 } from "crc";
import ethernet, { Ethernet, EthernetHeader, EtherType } from "../../models/4-link-layer/ethernet";
import { isEqual } from "../../util/byte-util";
import { Link } from "./link";
import { MACAddress, NIC, NICType, PacketInterrupt, Payload } from "./network-interface";

export class EthernetNIC implements NIC {
    nicType = NICType.ETHERNET;
    link: Link;
    hardwareAddr: MACAddress;
    promiscuousMode: boolean = false;
    interrupts = new Map<number, PacketInterrupt>();

    constructor(hardwareAddr: MACAddress, link: Link) {
        this.hardwareAddr = hardwareAddr;

        this.link = link;
        link.register(this.receive.bind(this));
    }

    public setPromiscuousMode(mode: boolean) {
        this.promiscuousMode = mode;
    }

    public send(destination: MACAddress, data: Payload, protocol: EtherType) {
        const frameHeader: Ethernet = {
            preamble: ethernet.PREAMBLE,
            startFrameDelimiter: ethernet.START_FRAME_DELIMITER,
            macSource: this.hardwareAddr,
            macDestination: destination,
            etherType: protocol
        }

        const frameCheckSequence = this.calculateFCS(frameHeader, data, ethernet.IDLE_FRAME_GAP);

        const frameSize = EthernetHeader.getWidth() + data.byteLength + frameCheckSequence.byteLength + ethernet.IDLE_FRAME_GAP.byteLength;
        const buffer = Buffer.alloc(frameSize);
        buffer.set(EthernetHeader.toWireFormat(frameHeader));
        buffer.set(data, EthernetHeader.getWidth());
        buffer.set(frameCheckSequence, EthernetHeader.getWidth() + data.byteLength);
        buffer.set(ethernet.IDLE_FRAME_GAP, EthernetHeader.getWidth() + data.byteLength + frameCheckSequence.byteLength);

        this.link.send(buffer);
    }

    public broadcast(data: Payload, protocol: EtherType) {
        this.send(new Uint8Array(Array(6).fill(0xFF)), data, protocol);
    }

    public register(protocol: EtherType, interrupt: PacketInterrupt) {
        if (this.interrupts.has(protocol)) {
            throw new Error(`Already defined an interrupt for protocol ${protocol.toString()}`);
        }

        this.interrupts.set(protocol, interrupt);
    }

    private calculateFCS(frame: Ethernet, payload: Payload, idleGap: Uint8Array): Uint8Array {
        const frameSize = 22 + payload.byteLength + idleGap.length;
        const buffer = Buffer.alloc(frameSize);
        buffer.set(frame.preamble, 0);
        buffer.set([frame.startFrameDelimiter], 7);
        buffer.set(frame.macDestination, 8)
        buffer.set(frame.macSource, 14);
        buffer.set([frame.etherType], 20);
        buffer.set(payload, 22);
        buffer.set(idleGap, 22 + payload.length);
        
        const fcs = Buffer.alloc(4);
        fcs.writeUInt32BE(crc32(buffer));
        return fcs;
    }

    private matchMac(destination: MACAddress) {
        return ethernet.isMACBroadcast(destination)
            || ethernet.isMACMulticast(destination)
            || isEqual(destination, this.hardwareAddr);
    }

    public receive(data: Uint8Array) {
        const packet = EthernetHeader.toModel(data);
        const headerSize = EthernetHeader.getWidth();
        const payload = data.slice(headerSize, data.byteLength - 16);
        const frameCheckSequence = data.slice(headerSize + payload.length, data.byteLength - 12);
        const idleGap = data.slice(headerSize + payload.length + frameCheckSequence.length);

        if (!(this.promiscuousMode || this.matchMac(packet.macDestination))) {
            // misaddressed packet, drop
            return;
        }

        if (!isEqual(this.calculateFCS(packet, payload, idleGap), frameCheckSequence)) {
            // bad checksum, drop
            return;
        }

        if (this.interrupts.has(packet.etherType)) {
            this.interrupts.get(packet.etherType)(payload);
        }
    }
}