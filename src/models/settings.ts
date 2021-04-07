export interface LocalSettings {
    ipoip: IPoIPSettings
}

export interface IPoIPSettings {
    profiles: Map<string, IPoIPProfile>
}

export interface IPoIPProfile {
    addr: string;
    port: string;
}