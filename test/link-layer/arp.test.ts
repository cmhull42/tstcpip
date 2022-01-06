import { ARP, ARPPacket, ARP_OPERATION } from "../../src/models/4-link-layer/arp";
import { ArpService } from "../../src/network/4-link-layer/arp";
import { NICType } from "../../src/network/4-link-layer/network-interface";

const mockBroadcast = jest.fn();
const mockSend = jest.fn();
const mockRegister = jest.fn();
const mockNIC: any = {
    nicType: NICType.ETHERNET,
    hardwareAddr: new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]),
    broadcast: mockBroadcast,
    register: mockRegister,
    send: mockSend
}

describe("ARP service", () => {
    describe("Probe", () => {
        it("returns true when no response", async () => {
            const arpService = new ArpService(mockNIC, new Uint8Array([10, 0, 0, 1]));

            const result = await arpService.probe(new Uint8Array([10, 0, 0, 1]));

            expect(result).toBe(true);
            expect(mockBroadcast).toBeCalled();
        });

        it("returns false when there is a response", async () => {
            let callback: (payload: Uint8Array) => void;

            mockRegister.mockImplementation((protocol: number, c) => {
                expect(protocol).toBe(0x0806);
                callback = c;
            });

            const arpService = new ArpService(mockNIC, new Uint8Array([10, 0, 0, 1]));
            mockNIC.register(0x0806, arpService.receive);

            const desiredAddress = new Uint8Array([10, 0, 0, 1]);
            const promise =  arpService.probe(desiredAddress);
            
            const reply: ARP = {
                hardwareType: new Uint8Array([0x00, 0x001]),
                protocolType: new Uint8Array([0x08, 0x00]),
                hardwareAddrLength: 6,
                protocolAddrLength: 4,
                operation: ARP_OPERATION.REPLY,
                senderHardwareAddr: new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x03]),
                senderProtocolAddr: desiredAddress,
                targetHardwareAddr: new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]),
                targetProtocolAddr: new Uint8Array([0x00, 0x00, 0x00, 0x00])
            }

            callback.bind(arpService)(ARPPacket.toWireFormat(reply));

            const result = await promise;

            expect(result).toBe(false);
        })
    });
})