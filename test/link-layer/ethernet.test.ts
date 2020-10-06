import { EthernetNIC } from "../../src/network/link-layer/ethernet"
import { TextDecoder } from "util";
import { InternalLink } from "../../src/network/link-layer/link";
describe("Ethernet protocol", () => {

    it("Can receive correctly addressed packets", () => {
        const int1Receive = jest.fn();
        const int2Receive = jest.fn();

        const MESSAGE1 = "hello there!";
        const MESSAGE2 = "hi!";

        const mac1 = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]);
        const mac2 = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x02]);

        const link1 = new InternalLink();
        const link2 = new InternalLink();

        const nic1 = new EthernetNIC(mac1, link1);
        nic1.register(0x01, int1Receive);
        const nic2 = new EthernetNIC(mac2, link2);
        nic2.register(0x01, int2Receive);

        int2Receive.mockImplementation((data: Uint8Array) => {
            expect(new TextDecoder().decode(data)).toBe(MESSAGE1)
            nic2.send(mac1, Buffer.from(MESSAGE2), 0x01);
        });

        int1Receive.mockImplementation((data: Uint8Array) => {
            expect(new TextDecoder().decode(data)).toBe(MESSAGE2);
        })

        link1.connect(link2);

        nic1.send(mac2, Buffer.from(MESSAGE1), 0x01);
    });

    it("can receive broadcast packets", () => {
        const int1Receive = jest.fn();
        const int2Receive = jest.fn();

        const MESSAGE1 = "hello there!";
        const MESSAGE2 = "hi!";

        const mac1 = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]);
        const mac2 = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x02]);

        const link1 = new InternalLink();
        const link2 = new InternalLink();

        const nic1 = new EthernetNIC(mac1, link1);
        nic1.register(0x01, int1Receive);
        const nic2 = new EthernetNIC(mac2, link2);
        nic2.register(0x01, int2Receive);

        int2Receive.mockImplementation((data: Uint8Array) => {
            expect(new TextDecoder().decode(data)).toBe(MESSAGE1)
            nic2.send(mac1, Buffer.from(MESSAGE2), 0x01);
        });

        int1Receive.mockImplementation((data: Uint8Array) => {
            expect(new TextDecoder().decode(data)).toBe(MESSAGE2);
        })

        link1.connect(link2);

        nic1.broadcast(Buffer.from(MESSAGE1), 0x01);

        expect(int2Receive).toBeCalled();
        expect(int1Receive).toBeCalled();
    })
})