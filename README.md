# Cloudinary Last Action Reports CLI

### **WARNING:** This tool is very alpha, expect breaking changes. Use at your own risk!

## Description

Cloudinary Last Action Reports CLI is a tool designed for Cloudinary users to manage and retrieve last access reports. This tool allows you to create new reports, fetch detailed information on existing reports, and export assets from the report to CSV.

_This tool is not officially supported by Cloudinary._

## Installation

To install the CLI, run the following command:

```bash
pnpm install @b-rad/cld -g
```

(Or npm, yarn, etc)

## Configuration

Before using the CLI, you need to set up your Cloudinary credentials. This can be done by running the config command:

```bash
cld config
```

You will be prompted to enter your Cloudinary cloud name, API key, and API secret.

## Usage

The CLI offers several commands:

config
Create or update your Cloudinary credentials.

```bash
cld config
```

`create-report`
Create a new last access report.

```bash
cld create-report
```

`get-all-reports`
Retrieve all last access reports.

```bash
cld get-all-reports
```

`get-report-details`
Get details of a specific last access report by its ID.

```bash
cld get-report-details
```

`get-assets-in-report`
Get all assets in a last access report by ID and export them to a CSV file.

```bash
cld get-assets-in-report
```

TODO

- [ ] Separate into multiple files. (Big Tas)
- [ ] Graceful exit with ctrl+c

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
