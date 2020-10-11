import { Args, main } from ".";
import { Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPLink } from "../network/link-layer/ipoip";

async function ipoip(args: Args) {
    const link1 = new IPOIPLink(args.port.toString());

    const device1 = new Ipv4OverEthernet(link1, args.mac, args.ip);

    link1.connect(args.endpoint);

    device1.ipv4.send(
        new Uint8Array([10, 0, 0, 2]),
        0x17,
        Buffer.from("test"),
        4
    );
}

main(ipoip);