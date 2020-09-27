import { IPV4Header } from "../../src/models/internet-layer/ip";
import { Ipv4Protocol } from "../../src/network/internet-layer/ipv4"
import { EthernetNIC } from "../../src/network/link-layer/ethernet"

describe("IPV4 Protocol", () => {
    it("Can send over ipv4", async () => {
        const device2Receive = jest.fn().mockImplementation((payload) => {
            expect(payload).toStrictEqual(Buffer.from("Hello there!"))
        })

        const nic1 = new EthernetNIC(new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]));
        const address1 = new Uint8Array([10, 0, 0, 1]);
        const ipDevice1 = new Ipv4Protocol(nic1, address1);

        const nic2 = new EthernetNIC(new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x02]));
        const address2 = new Uint8Array([10, 0, 0, 2]);
        const ipDevice2 = new Ipv4Protocol(nic2, address2);

        nic2.connect(nic1);
        ipDevice2.register(0x17, device2Receive);

        await ipDevice1.send(address2, 0x17, Buffer.from("Hello there!"), 2);
        expect(device2Receive).toBeCalled();
    });

    it("Computes header checksum correctly", () => {
        const payload = new Uint8Array([
            0x45, 0x00, 0x00, 0x73, 
            0x00, 0x00, 0x40, 0x00,
            0x40, 0x11, 0x00, 0x00, 
            0xc0, 0xa8, 0x00, 0x01,
            0xc0, 0xa8, 0x00, 0xc7
        ]);

        const checksum = IPV4Header.calculateChecksum(payload);
        expect(checksum).toBe(0xB861);
    });
});