export interface InitializeParams {
  clientInfo: {
    name: string;
    title: string;
    version: string;
  };
}

export class AppServerClient {
  async initialize(params: InitializeParams): Promise<string> {
    const { name, version } = params.clientInfo;
    return `initialize prepared for ${name} (${version}).`;
  }
}
