import { Args, main } from ".";
import { Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPLink } from "../network/link-layer/ipoip";

async function ipoip(args: Args) {
    const link1 = new IPOIPLink(args.port.toString());

    const device1 = new Ipv4OverEthernet(link1, args.mac, args.ip);
    console.log(`Built device with hwaddr: <${args.mac}>, netaddr: <${args.ip}>`)

    link1.connect(args.endpoint);
    console.log(`IPOIP - Connected to ${args.endpoint}`);

    const pingAddr = "10.0.0.2";
    const payload = "@hull.is/ping 0.0.1"
    console.log(`Pinging device at <${pingAddr}> with payload ${payload}`);

    device1.ping(pingAddr, payload);
}

main(ipoip);