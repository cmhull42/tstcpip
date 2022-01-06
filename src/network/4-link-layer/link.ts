export type LinkCallback = (data: Uint8Array) => any;

export interface Link {
    send: (data: Uint8Array) => Promise<void> | void;
    register: (callback: LinkCallback) => void;
}

export class InternalLink implements Link {
    link: InternalLink;
    onReceive: LinkCallback;

    connect(link: InternalLink) {
        if (!this.link) {
            this.link = link;
    
            link.connect(this);
        }
    }

    register(callback: LinkCallback) {
        this.onReceive = callback;
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
        this.onReceive(data);
    }
}