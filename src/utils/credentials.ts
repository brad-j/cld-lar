import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { input, select } from '@inquirer/prompts';

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

const config_path = path.join(os.homedir(), '.cld_lar_config.json');

let global_credentials: CloudinaryConfig | undefined;

export const load_saved_config = (): CloudinaryConfig | undefined => {
  if (fs.existsSync(config_path)) {
    const saved_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    if (isCloudinaryConfig(saved_config)) {
      return saved_config;
    }
  }
  return undefined;
};

function isCloudinaryConfig(object: any): object is CloudinaryConfig {
  return (
    'cloud_name' in object && 'api_key' in object && 'api_secret' in object
  );
}

export const save_config = (config: CloudinaryConfig): void => {
  fs.writeFileSync(config_path, JSON.stringify(config));
  global_credentials = config;
};

export const prompt_for_credentials = async (): Promise<CloudinaryConfig> => {
  if (isCloudinaryConfig(global_credentials)) {
    return global_credentials;
  }

  const use_saved_config = await select({
    message: 'Do you want to use saved credentials?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  if (use_saved_config === true) {
    const saved_config = load_saved_config();
    if (saved_config) {
      global_credentials = saved_config;
      return saved_config;
    }
  }

  // Prompt for new credentials
  const cloud_name = await input({
    message: 'Enter your Cloudinary cloud name',
  });
  const api_key = await input({
    message: 'Enter your Cloudinary API key',
  });
  const api_secret = await input({
    message: 'Enter your Cloudinary API secret',
  });

  const new_config: CloudinaryConfig = {
    cloud_name,
    api_key,
    api_secret,
  };

  save_config(new_config);
  return new_config;
};
