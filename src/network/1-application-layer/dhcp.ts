import { DHCP, DhcpPacket } from "../../models/1-application-layer/dhcp";
import { UDP } from "../../models/2-transport-layer/udp";
import { UdpProtocol } from "../2-transport-layer/udp";
import { v4 as uuidv4 } from "uuid";
import { bytesToUnsignedNumber } from "../../util/byte-util";
import { BROADCAST_ADDRESS } from "../../models/3-internet-layer/ip";

export const DHCP_CLIENT_PORT = 68;
export const DHCP_SERVER_PORT = 67;

export class DhcpServer {
  private readonly udpProtocol: UdpProtocol;

  constructor(udpProtocol: UdpProtocol) {
    this.udpProtocol = udpProtocol;

    this.udpProtocol.listen(DHCP_SERVER_PORT, this.receive.bind(this));
  }

  private receive(packet: UDP, payload: Uint8Array) {
    console.log(packet);
    const dhcpPacket = DhcpPacket.toModel(payload);
    console.log(dhcpPacket);
  }
}

export class DhcpClient {
  private readonly udpProtocol: UdpProtocol;

  constructor(udpProtocol: UdpProtocol) {
    this.udpProtocol = udpProtocol;

    this.udpProtocol.listen(DHCP_CLIENT_PORT, this.receive.bind(this));
  }

  private receive(packet: UDP, payload: Uint8Array) {

  }

  public send_dhcp_discover() {
    const xid = new Uint8Array(4);
    uuidv4({}, xid);

    const chaddr = new Uint8Array(8);
    chaddr.set(this.udpProtocol.ipv4.nic.hardwareAddr);

    const packet: DHCP = {
      op: DhcpOperation.DISCOVER,
      htype: 1, // ethernet
      hlen: 6, // eth length,
      hops: 0,
      xid: bytesToUnsignedNumber(xid),
      secs: 0,
      flags: Buffer.from([0, 0]),
      ciaddr: Buffer.from([0, 0, 0, 0]),
      yiaddr: Buffer.from([0, 0, 0, 0]),
      siaddr: Buffer.from([0, 0, 0, 0]),
      giaddr: Buffer.from([0, 0, 0, 0]),
      chaddr: chaddr,
      padding: new Uint8Array(192),
      cookie: new Uint8Array([99, 130, 83, 99]),
    }

    const wire = DhcpPacket.toWireFormat(packet);
    this.udpProtocol.transmit(
      DHCP_CLIENT_PORT, 
      DHCP_SERVER_PORT, 
      BROADCAST_ADDRESS, 
      wire
    );
  }
}

export enum DhcpOperation {
  DISCOVER = 1,

}