import { Command } from 'commander';
import { prompt_for_credentials, save_config } from '../utils/credentials';

export const configCommand = (program: Command) => {
  program
    .command('config')
    .description('Create/Update Cloudinary credentials')
    .action(async () => {
      const new_config = await prompt_for_credentials();

      save_config(new_config);
      console.log('Credentials updated successfully.');
    });
};
