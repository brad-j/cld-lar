import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as csv from 'fast-csv';
import moment from 'moment';
import { input, checkbox, select } from '@inquirer/prompts';

const base_url = 'https://api.cloudinary.com/v1_1/';

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

interface RequestBody {
  max_results: number;
  next_cursor?: string;
}

interface LastAccessReportRequestBody {
  from_date: string;
  to_date: string;
  resource_type?: string | string[];
  sort_by?: string;
  direction?: string;
}

interface Resource {
  last_access: string;
  public_id: string;
  secure_url: string;
}

const config_path = path.join(os.homedir(), '.cld_lar_config.json');

let global_credentials: CloudinaryConfig | undefined;

let saved_config: CloudinaryConfig;

if (fs.existsSync(config_path)) {
  const saved_config = JSON.parse(
    fs.readFileSync(config_path, 'utf8')
  ) as CloudinaryConfig;
  global_credentials = saved_config;
}

async function prompt_for_credentials() {
  if (global_credentials) {
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
    global_credentials = saved_config;
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

    const new_config = {
      cloud_name,
      api_key,
      api_secret,
    };
    fs.writeFileSync(config_path, JSON.stringify(new_config));
    global_credentials = new_config;

    return new_config;
  }
}

program
  .name('cld')
  .usage('<command>')
  .description(
    'CLI tool for Cloudinary operations (Currently only last access reports)'
  );

program
  .command('config')
  .description('Create/Update Cloudinary credentials')
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
    if (!global_credentials) {
      await prompt_for_credentials();
    }

    let credentials;

    if (global_credentials) {
      credentials = global_credentials;
    } else {
      credentials = await prompt_for_credentials();
      global_credentials = credentials;
    }
    const { cloud_name, api_key, api_secret } = global_credentials;

    const resource_type = await select({
      message: 'Select resource type (Only choose one)',
      choices: [
        { name: 'all', value: '' },
        { name: 'image', value: 'image' },
        { name: 'video', value: 'video' },
        { name: 'raw', value: 'raw' },
      ],
    });

    const from_date = await input({
      message: 'Enter the start date (YYYY-MM-DD)',
    });
    const to_date = await input({
      message: 'Enter the end date (YYYY-MM-DD)',
    });

    console.log('Creating report...');

    async function create_last_access_report() {
      const full_url = `${base_url}${cloud_name}/resources_last_access_reports`;

      let request_body: LastAccessReportRequestBody = {
        from_date: from_date,
        to_date: to_date,
        resource_type: resource_type,
        sort_by: 'accessed_at',
        direction: 'desc',
      };

      const response = await fetch(full_url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            api_key + ':' + api_secret
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request_body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Check your API key and secret.');
        } else if (response.status === 404) {
          console.error('Not Found: The requested resource does not exist.');
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.error('Error response:', text);
        return;
      }

      const data = await response.json();
      return data;
    }

    create_last_access_report().then(console.log).catch(console.error);
  });

program
  .command('get-all-reports')
  .description('Get all last access reports')
  .action(async () => {
    console.log('Getting all reports...');

    if (!global_credentials) {
      console.log('Using global credentials:', global_credentials);

      await prompt_for_credentials();
    }

    let credentials;

    if (global_credentials) {
      credentials = global_credentials;
    } else {
      credentials = await prompt_for_credentials();
      global_credentials = credentials;
    }

    const { cloud_name, api_key, api_secret } = global_credentials;

    async function get_all_access_reports() {
      const full_url = `${base_url}${cloud_name}/resources_last_access_reports`;

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(
            api_key + ':' + api_secret
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Check your API key and secret.');
        } else if (response.status === 404) {
          console.error('Not Found: The requested resource does not exist.');
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.error('Error response:', text);
        return;
      }

      const data = await response.json();
      return data;
    }

    get_all_access_reports().then(console.log).catch(console.error);
  });

program
  .command('get-report-details')
  .description('Get the details of a last access report by ID')
  .action(async () => {
    if (!global_credentials) {
      await prompt_for_credentials();
    }

    let credentials;

    if (global_credentials) {
      credentials = global_credentials;
    } else {
      credentials = await prompt_for_credentials();
      global_credentials = credentials;
    }

    const { cloud_name, api_key, api_secret } = credentials;

    const report_id = await input({
      message: 'Enter your Cloudinary report ID',
    });

    async function get_access_report_details() {
      const full_url = `${base_url}${cloud_name}/resources_last_access_reports/${report_id}`;

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(
            api_key + ':' + api_secret
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Check your API key and secret.');
        } else if (response.status === 404) {
          console.error('Not Found: The requested resource does not exist.');
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.error('Error response:', text);
        return;
      }

      const data = await response.json();
      console.log(data);
      return data;
    }

    get_access_report_details();
  });

program
  .command('get-assets-in-report')
  .description('Get all assets in a last access report by ID')
  .action(async () => {
    if (!global_credentials) {
      await prompt_for_credentials();
    }

    let credentials;

    if (global_credentials) {
      credentials = global_credentials;
    } else {
      credentials = await prompt_for_credentials();
      global_credentials = credentials;
    }

    const { cloud_name, api_key, api_secret } = credentials;

    const report_id = await input({
      message: 'Enter your Cloudinary report ID',
    });

    const output_directory = await input({
      message: 'Enter the path to save the CSV file',
      default: '.',
    });
    const output_filename = await input({
      message: 'Enter the filename for the CSV file',
      default: 'last-access-report.csv',
    });

    const full_output_path = path.join(output_directory, output_filename);
    console.log(`Saving output to: ${full_output_path}`);

    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream(full_output_path);

    csvStream.pipe(writableStream);

    async function get_access_report_resources(
      next_cursor?: string,
      allResources: Resource[] = []
    ): Promise<void> {
      let full_url = `${base_url}${cloud_name}/resources/last_access_report/${report_id}?max_results=500`;
      if (next_cursor) {
        full_url += `&next_cursor=${encodeURIComponent(next_cursor)}`;
      }

      const response = await fetch(full_url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(
            api_key + ':' + api_secret
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Check your API key and secret.');
        } else if (response.status === 404) {
          console.error('Not Found: The requested resource does not exist.');
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.error('Error response:', text);
        return;
      }

      const data = await response.json();
      allResources.push(...data.resources);

      if (data.next_cursor) {
        await get_access_report_resources(data.next_cursor, allResources);
      } else {
        allResources.sort((a, b) =>
          moment(b.last_access).diff(moment(a.last_access))
        );

        allResources.forEach(resource => {
          const formatted_date = moment(resource.last_access).format(
            'MM-DD-YYYY'
          );
          const csvData = {
            last_access_date: formatted_date,
            public_id: resource.public_id,
            secure_url: resource.secure_url,
          };
          csvStream.write(csvData);
        });

        csvStream.end();
      }
    }

    get_access_report_resources().catch(console.error);
  });

program.parse(process.argv);
