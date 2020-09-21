import { Connectable, Link } from "./link";

export type TAPInterceptor = (data: Uint8Array) => Uint8Array;

export class TAP {
    linkA: Link;
    linkB: Link;

    onSend: TAPInterceptor;
    onReceive: TAPInterceptor;

    constructor(onSend?: TAPInterceptor, onReceive?: TAPInterceptor) {
        this.onSend = onSend;
        this.onReceive = onReceive;

        this.linkA = new Link((data, link) => {
            const newData = this.onSend(data);
            this.linkB.link.receive(newData);
        });

        this.linkB = new Link((data, link) => {
            const newData = this.onReceive(data);
            this.linkA.link.receive(newData);
        });
    }

    connectPortA(link: Connectable) {
        this.linkA.connect(link);
    }

    connectPortB(link: Connectable) {
        this.linkB.connect(link);
    }
}