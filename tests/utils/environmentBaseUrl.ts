const environmentBaseUrl = {
    ci: {
      prefix: 'https://demoqa',
      suffix: '.com',
    },
    local: {
      api: 'https://demoqa.com',
      home: 'https://demoqa.com',
    },
    production: {
      api: 'https://demoqa.com',
      home: 'https://demoqa.com',
    },
    staging: {
      api: 'https://demoqa.com',
      home: 'https://demoqa.com',
    },
} as const;

export type RuntimeEnvironment = 'local' | 'production' | 'staging';

export function getRuntimeEnvironment(env = process.env.ENV): RuntimeEnvironment {
  switch (env) {
    case 'production':
    case 'staging':
    case 'local':
      return env;
    default:
      return 'local';
  }
}

export default environmentBaseUrl;
  