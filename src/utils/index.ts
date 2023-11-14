import { program } from 'commander';
import { configCommand } from '../commands/config';
// import { createReportCommand } from '../commands/create-report';
// ... import other commands

// Setup your program (commander) instance
program.name('cld').usage('<command>');

// Use the imported commands
configCommand(program);
// createReportCommand(program);
// ... use other commands

program.parse(process.argv);
