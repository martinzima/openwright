export interface IEnvironmentConfig {
  readonly production: boolean;
  readonly apiGatewayUrl: string;
  readonly appVersion: string;
}

export abstract class EnvironmentConfig {
  private static _config: IEnvironmentConfig;

  static get config(): IEnvironmentConfig {
    return this._config;
  }

  static setFromConfigs(configs: Partial<IEnvironmentConfig>[]) {
    let config = this.mergeEnvironmentConfigs(configs);
    config = this.sanitizeEnvironmentConfig(config);

    this._config = config;
  }

  private static mergeEnvironmentConfigs(configs: Partial<IEnvironmentConfig>[]): IEnvironmentConfig {
    const result: Partial<IEnvironmentConfig> = {};

    for (const config of configs) {
      for (const key of Object.keys(config)) {
        if ((config as Record<string, unknown>)[key] !== undefined) {
          (result as Record<string, unknown>)[key] = (config as Record<string, unknown>)[key];
        }
      }
    }

    return result as IEnvironmentConfig;
  }

  private static sanitizeEnvironmentConfig(config: IEnvironmentConfig): IEnvironmentConfig {
    let apiGatewayUrl = config.apiGatewayUrl;
    if (apiGatewayUrl.endsWith('/')) {
      apiGatewayUrl = apiGatewayUrl.substr(0, apiGatewayUrl.length - 1);
    }

    if (!isAbsoluteUrl(apiGatewayUrl)) {
      apiGatewayUrl = `${location.origin}${apiGatewayUrl.startsWith('/') ? '' : '/' }${apiGatewayUrl}`;
    }

    return {
      ...config,
      apiGatewayUrl
    };
  }
}

const absoluteUrlRegex = new RegExp('^(?:[a-z+]+:)?//', 'i');

function isAbsoluteUrl(url: string): boolean {
  return absoluteUrlRegex.test(url);
}
