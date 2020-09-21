

export interface Connectable {
    link: Link;
    connect: (connectable: Connectable) => void;
}

export class Link implements Connectable {
    link: Link;
    onReceive: (data: Uint8Array, link: Link) => void;

    constructor(onReceive: (data: Uint8Array, link: Link) => void) {
        this.onReceive = onReceive;
    }

    connect(connectable: Connectable) {
        if (!this.link) {
            if (connectable instanceof Link) {
                this.link = connectable;
            } 
            else {
                this.link = connectable.link;
            }
    
            connectable.connect(this);
        }
    }

    isConnected() {
        return Boolean(this.link);
    }

    send(data: Uint8Array) {
        if (this.isConnected()) {
            this.link.receive(data);
        }
    }

    receive(data: Uint8Array) {
        this.onReceive(data, this);
    }
}