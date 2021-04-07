import { ICMPHeader, ICMPRequestReplyHeader, ICMPType } from "../../models/internet-layer/icmp";
import { Ipv4Protocol } from "./ipv4";
import * as ip from "../../models/internet-layer/ip";

export class ICMPProtocol {
    ipv4: Ipv4Protocol;
    identifier: number;
    sequence: number;

    IPV4_PROTOCOL_NUMBER = 1;
    DEFAULT_TTL = 56;

    constructor(ipv4: Ipv4Protocol, identifier: number) {
        this.ipv4 = ipv4;
        this.identifier = identifier;
        this.sequence = 0;

        this.ipv4.register(this.IPV4_PROTOCOL_NUMBER, this.receive.bind(this));
    }

    async echo_request(addr: Uint8Array, payload?: string) {
        let _payload = null;
        if (!payload) {
            _payload = this.generatePayload(1024);
        }
        else {
            _payload = new TextEncoder().encode(payload);
        }

        
        await this.send_echo(ICMPType.ECHO_REQUEST, addr, _payload);
    }

    async echo_reply(addr: Uint8Array, payload: Uint8Array) {
        await this.send_echo(ICMPType.ECHO_REPLY, addr, payload);
    }

    private async send_echo(type: ICMPType, addr: Uint8Array, payload: Uint8Array) {
        const model: ICMPRequestReplyHeader = {
            type: type,
            code: 0,
            checksum: 0,
            identifier: this.identifier,
            sequence: this.sequence
        };

        let header = ICMPRequestReplyHeader.toWireFormat(model);
        model.checksum = ip.calculateChecksum(header);
        header = ICMPRequestReplyHeader.toWireFormat(model);

        const headerWidthBytes = ICMPRequestReplyHeader.getWidth(model);
        const wire = Buffer.alloc(headerWidthBytes + payload.byteLength);
        wire.set(header);
        wire.set(payload, headerWidthBytes);

        await this.ipv4.send(addr, this.IPV4_PROTOCOL_NUMBER, wire, this.DEFAULT_TTL);

        // inc packet sequence
        this.sequence += 1;
    }

    private generatePayload(length: number): Uint8Array {
        const payloadRange = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const randomAscii = () => payloadRange.charAt(Math.floor(Math.random() * payloadRange.length));
        const payload = Array.from({ length }, randomAscii).join("");
        return new TextEncoder().encode(payload);
    }

    private receive(packet: Uint8Array, sender: ip.IPV4Address) {
        const icmpHeader = ICMPHeader.toModel(packet);

        switch(icmpHeader.type) {
            case ICMPType.ECHO_REQUEST:
                this.receive_request(packet, sender);
                return;
            case ICMPType.ECHO_REPLY:
                this.receive_reply(packet, sender);
                return;
        }
    }

    private receive_request(packet: Uint8Array, sender: ip.IPV4Address) {
        const requestHeader = ICMPRequestReplyHeader.toModel(packet);
        const payload = packet.slice(ICMPRequestReplyHeader.getWidth(requestHeader));
        console.log(`Replying to echo request from <${ip.toString(sender)}> payload: ${new TextDecoder().decode(payload)}`);
        this.echo_reply(sender, payload);
    }

    private receive_reply(packet: Uint8Array, sender: ip.IPV4Address) {
        const requestHeader = ICMPRequestReplyHeader.toModel(packet);
        const payload = packet.slice(ICMPRequestReplyHeader.getWidth(requestHeader));
        console.log(`Received ICMP ECHO - source: <${ip.toString(sender)}> payload: ${new TextDecoder().decode(payload)}`);
    }
}