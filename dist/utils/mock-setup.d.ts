export interface MockConfig {
    enabled: boolean;
    data: string;
    server: string;
    autoSetup: {
        plugin: string;
        configPath: string;
    };
}
export declare const setupMocks: (config: MockConfig) => Promise<void>;
