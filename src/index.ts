import dotenv from 'dotenv';
dotenv.config();

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as csv from 'fast-csv';
import { v2 as cloudinary } from 'cloudinary';
import { input, checkbox } from '@inquirer/prompts';

const api_key = process.env.API_KEY as string;
const api_secret = process.env.API_SECRET as string;
const base_url = process.env.BASE_URL as string;

interface CloudinaryConfig {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
}

const config_path = path.join(os.homedir(), '.cld_lar_config.json');

let saved_config: CloudinaryConfig;
if (fs.existsSync(config_path)) {
  saved_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
}

async function prompt_for_credentials() {
  const use_saved_config = await checkbox({
    message: 'Do you want to use saved credentials?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  if (use_saved_config[0]) {
    return saved_config;
  } else {
    const cloud_name = await input({
      message: 'Enter your Cloudinary cloud name',
      default: saved_config?.cloud_name,
    });
    const api_key = await input({
      message: 'Enter your Cloudinary API key',
      default: saved_config?.api_key,
    });
    const api_secret = await input({
      message: 'Enter your Cloudinary API secret',
      default: saved_config?.api_secret,
    });
    return {
      cloud_name,
      api_key,
      api_secret,
    };
  }
}

function configure_cloudinary(
  cloud_name?: string,
  api_key?: string,
  api_secret?: string
) {
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });
}

program
  .command('config')
  .description('Update Cloudinary credentials')
  .action(async () => {
    const cloud_name_answer = await input({
      message: 'Enter your Cloudinary cloud name',
      default: saved_config?.cloud_name,
    });
    const api_key_answer = await input({
      message: 'Enter your Cloudinary API key',
      default: saved_config?.api_key,
    });
    const api_secret_answer = await input({
      message: 'Enter your Cloudinary API secret',
      default: saved_config?.api_secret,
    });

    const new_config = {
      cloud_name: cloud_name_answer,
      api_key: api_key_answer,
      api_secret: api_secret_answer,
    };
    fs.writeFileSync(config_path, JSON.stringify(new_config));
    console.log('Credentials updated successfully.');
  });

program
  .command('create-report')
  .description('Create a last access report')
  .action(async () => {
    const credentials = await prompt_for_credentials();
    const { cloud_name, api_key, api_secret } = credentials;

    configure_cloudinary(cloud_name, api_key, api_secret);

    const from_date = await input({
      message: 'Enter the start date (YYYY-MM-DD)',
    });
    const to_date = await input({
      message: 'Enter the end date (YYYY-MM-DD)',
    });
    const resource_type = await checkbox({
      message: 'Select resource types (Default all)',
      choices: [
        { name: 'image', value: 'image' },
        { name: 'video', value: 'video' },
        { name: 'raw', value: 'raw' },
      ],
    });

    console.log('Creating report...');

    async function create_last_access_report() {
      if (!base_url || !api_key || !api_secret) {
        throw new Error('Environment variables are missing.');
      }

      const full_url = `${base_url}/resources_last_access_reports`;

      const response = await fetch(full_url, {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(api_key + ':' + api_secret).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_date: from_date,
          to_date: to_date,
          if(resource_type: string | string[]) {
            resource_type: resource_type;
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    }

    create_last_access_report().then(console.log).catch(console.error);
  });

program
  .description('Get all last access reports')
  .command('get-all-reports')
  .action(async () => {
    const credentials = await prompt_for_credentials();
    const { cloud_name, api_key, api_secret } = credentials;

    configure_cloudinary(cloud_name, api_key, api_secret);

    async function get_all_access_reports() {
      if (!base_url || !api_key || !api_secret) {
        throw new Error('Environment variables are missing.');
      }

      const full_url = `${base_url}/resources_last_access_reports`;

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(api_key + ':' + api_secret).toString('base64'),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    }

    get_all_access_reports().then(console.log).catch(console.error);
  });

program
  .description('Get the details of a last access report by ID')
  .command('get-report-details')
  .action(async () => {
    const credentials = await prompt_for_credentials();
    const { cloud_name, api_key, api_secret } = credentials;

    configure_cloudinary(cloud_name, api_key, api_secret);

    const report_id = await input({
      message: 'Enter your Cloudinary report ID',
    });

    async function get_access_report_details() {
      if (!base_url || !api_key || !api_secret) {
        throw new Error('Environment variables are missing.');
      }

      const full_url = `${base_url}/resources_last_access_reports/${report_id}`;

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(api_key + ':' + api_secret).toString('base64'),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data;
    }

    get_access_report_details();
  });

program
  .description('Get all assets in a last access report by ID')
  .command('get-assets-in-report')
  .action(async () => {
    const credentials = await prompt_for_credentials();
    const { cloud_name, api_key, api_secret } = credentials;

    configure_cloudinary(cloud_name, api_key, api_secret);

    const report_id = await input({
      message: 'Enter your Cloudinary report ID',
    });

    async function get_access_report_resources() {
      if (!base_url || !api_key || !api_secret) {
        throw new Error('Environment variables are missing.');
      }

      const report_id =
        'dd354dc4b9c5d597cebe99f8b74eb1912196dc14f5441317fd1b2768d385668e';

      const full_url = `${base_url}/resources/last_access_report/${report_id}`;

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(api_key + ':' + api_secret).toString('base64'),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data;
    }

    get_access_report_resources();
  });

program.parse(process.argv);
