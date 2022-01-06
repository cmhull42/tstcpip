import { UDP, UDP as UDPHeader, UDPPacket } from "../../models/2-transport-layer/udp";
import { IPV4Address } from "../../models/3-internet-layer/ip";
import { Ipv4Protocol } from "../3-internet-layer/ipv4";

export type UdpCallback = (packet: UDPHeader, payload: Uint8Array) => any;

export class UdpProtocol {
  public readonly IPV4_PROTOCOL_NUMBER = 17;
  public readonly ipv4: Ipv4Protocol;
  private readonly portRegistry = new Map<number, UdpCallback>()

  constructor(ipv4: Ipv4Protocol) {
    this.ipv4 = ipv4;

    this.ipv4.register(this.IPV4_PROTOCOL_NUMBER, this.receive.bind(this));
  }

  private receive(data: Uint8Array) {
    const packet = UDPPacket.toModel(data);
    const headerWidth = UDPPacket.getWidth(null);
    const payload = data.slice(headerWidth);

    const listener = this.portRegistry.get(packet.destPort);
    if (listener) {
      listener(packet, payload);
    }
  }

  public listen(port: number, callback: UdpCallback) {
    const listener = this.portRegistry.get(port);
    if (listener) {
      throw new Error(`Unable to bind to port ${port}: in use`);
    }

    this.portRegistry.set(port, callback);
  }

  public async transmit(sourcePort: number, destPort: number, destAddress: IPV4Address, payload: Uint8Array) {
    const packet: UDP = {
      destPort: destPort,
      sourcePort: sourcePort,
      length: payload.length,
      checksum: Buffer.from([0,0,0,0])
    }
    const header = UDPPacket.toWireFormat(packet);
    const headerLength = UDPPacket.getWidth(header);
    const wire = new Uint8Array(headerLength + payload.byteLength);
    wire.set(header);
    wire.set(payload, headerLength);

    await this.ipv4.send(destAddress, this.IPV4_PROTOCOL_NUMBER, wire, 100);
  }
}