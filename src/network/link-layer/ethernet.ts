import { crc32 } from "crc";
import ethernet, { Ethernet, EthernetPacket } from "../../models/ethernet";
import { isEqual } from "../../util/byte-util";
import { Link } from "./link";
import { MACAddress, NIC, Payload } from "./network-interface";

export class EthernetNIC implements NIC {
    link: Link;
    mac: MACAddress;
    interrupt: (data: Payload) => void;
    promiscuousMode: boolean = false;

    constructor(mac: MACAddress, interrupt: (data: Payload) => void) {
        this.mac = mac;
        this.interrupt = interrupt;

        this.link = new Link((data, link) => {
            this.receive(data);
        });
    }

    public setPromiscuousMode(mode: boolean) {
        this.promiscuousMode = mode;
    }

    public connect(nic: EthernetNIC) {
        this.link.connect(nic);
    }

    public send(destination: MACAddress, data: Payload) {
        const frame: Ethernet = {
            preamble: ethernet.PREAMBLE,
            startFrameDelimiter: ethernet.START_FRAME_DELIMITER,
            macSource: this.mac,
            macDestination: destination,
            payloadLength: data.byteLength,
            payload: data,
            frameCheckSequence: null,
            idleGap: ethernet.IDLE_FRAME_GAP
        }

        frame.frameCheckSequence = this.calculateFCS(frame);

        const packet = EthernetPacket.toWireFormat(frame);
        this.link.send(packet);
    }

    private calculateFCS(frame: Ethernet): Uint8Array {
        const frameSize = 44 + frame.payload.byteLength;
        const buffer = Buffer.alloc(frameSize);
        buffer.set(frame.preamble, 0);
        buffer.set([frame.startFrameDelimiter], 7);
        buffer.set(frame.macDestination, 8)
        buffer.set(frame.macSource, 14);
        buffer.set([frame.payloadLength], 20);
        buffer.set(frame.payload, 22);
        buffer.set(frame.idleGap, 22 + frame.payload.byteLength);
        
        const fcs = Buffer.alloc(4);
        fcs.writeUInt32BE(crc32(buffer));
        return fcs;
    }

    private matchMac(destination: MACAddress) {
        return ethernet.isMACBroadcast(destination)
            || ethernet.isMACMulticast(destination)
            || isEqual(destination, this.mac);
    }

    public receive(data: Uint8Array) {
        const packet = EthernetPacket.toModel(data);

        if (!(this.promiscuousMode || this.matchMac(packet.macDestination))) {
            // misaddressed packet, drop
            return;
        }

        if (!isEqual(this.calculateFCS(packet), packet.frameCheckSequence)) {
            // bad checksum, drop
            return;
        }

        this.interrupt(packet.payload);
    }
}