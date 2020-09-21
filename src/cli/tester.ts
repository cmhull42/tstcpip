import { EthernetNIC } from "../network/link-layer/ethernet";
import { TAP, TAPInterceptor } from "../network/link-layer/tap";

function main() {
    tap_ethernet_nics();
}

function tap_ethernet_nics() {
    const aliceMAC = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x01]);
    const alice = new EthernetNIC(aliceMAC, (data: Uint8Array) => {
        // don't care
    });

    const bobMAC = new Uint8Array([0x0A, 0x00, 0x00, 0x00, 0x00, 0x02]);
    const bob = new EthernetNIC(bobMAC, (data: Uint8Array) => {
        bob.send(aliceMAC, Buffer.from("ayyy"));
    });

    const logSend: TAPInterceptor = (data) => {
        console.log(`Interface A sent data to B: ${JSON.stringify(data)}`);
        return data;
    };

    const logReceive: TAPInterceptor = (data) => {
        console.log(`Interface B sent data to A: ${JSON.stringify(data)}`);
        return data;
    }

    const tap = new TAP(logSend, logReceive);

    tap.connectPortA(alice);
    tap.connectPortB(bob);

    alice.send(bobMAC, Buffer.from("hey there"));
}

main();