import dotenv from 'dotenv';
dotenv.config();

const api_key = process.env.API_KEY as string;
const api_secret = process.env.API_SECRET as string;
const base_url = process.env.BASE_URL as string;

const from_date = '2023-10-30';
const to_date = '2023-11-01';

// async function create_last_access_report() {
//   if (!base_url || !api_key || !api_secret) {
//     throw new Error('Environment variables are missing.');
//   }

//   const full_url = `${base_url}/resources_last_access_reports`;

//   const response = await fetch(full_url, {
//     method: 'POST',
//     headers: {
//       Authorization:
//         'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64'),
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       from_date: from_date,
//       to_date: to_date,
//     }),
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     console.error('Error response:', text);
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   const data = await response.json();
//   return data;
// }

// create_last_access_report().then(console.log).catch(console.error);

// async function get_all_access_reports() {
//   if (!base_url || !api_key || !api_secret) {
//     throw new Error('Environment variables are missing.');
//   }

//   const response = await fetch(base_url, {
//     method: 'GET',
//     headers: {
//       Authorization:
//         'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64'),
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     console.error('Error response:', text);
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   const data = await response.json();
//   console.log(data);
//   return data;
// }

// get_all_access_reports();

// async function get_access_report_details() {
//   if (!base_url || !api_key || !api_secret) {
//     throw new Error('Environment variables are missing.');
//   }

//   const report_id =
//     'dd354dc4b9c5d597cebe99f8b74eb1912196dc14f5441317fd1b2768d385668e';

//   const full_url = `${base_url}/resources_last_access_reports/${report_id}`;

//   const response = await fetch(full_url, {
//     method: 'GET',
//     headers: {
//       Authorization:
//         'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64'),
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     console.error('Error response:', text);
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   const data = await response.json();
//   console.log(data);
//   return data;
// }

// get_access_report_details();

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
        'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64'),
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
