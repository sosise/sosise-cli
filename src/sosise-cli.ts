import { Command } from 'commander';
import colors from 'colors';
import fs from 'fs';
import figlet from 'figlet';
import { execSync } from 'child_process';
import path from 'path';

// Specify sosise git clone path
const gitClonePath = 'https://github.com/sosise/sosise.git';

// Initialize commander
const program = new Command();
program.description(colors.yellow('Sosise installer'));

// Register new command
program
    .command('new <name>')
    .description('Sosise installer')
    .action((name) => {
        // Output
        console.log(colors.blue(figlet.textSync('Sosise')));
        console.log(colors.green('Crafting application...'));

        // Initialize new project path
        const projectPath = path.join(process.cwd(), name);

        // Do not proceed if project path is not empty
        if (fs.existsSync(projectPath)) {
            console.log(colors.red(`Application already exists! ${projectPath}`));
            process.exit(1);
        }

        // Clone project
        try {
            execSync(`git clone ${gitClonePath} ${name}`, {
                encoding: 'utf-8'
            });
            console.log(colors.green('Project cloned'));
        } catch (error) {
            console.log(colors.red('Error occured during cloning sosise, detailed information below'));
            console.log(colors.red(error));
        }

        // Copy .env.example to .env
        const envPath = path.join(projectPath, '.env');
        fs.copyFileSync(path.join(projectPath, '.env.example'), envPath);
        console.log(colors.green('Copied .env.example -> .env'));

        // Replace text in .env
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.replace(/Sosise/g, name);
        fs.writeFileSync(envPath, envContent);

        // Remove .git folder
        fs.rmdirSync(path.join(projectPath, '.git'), { recursive: true });

        try {
            // Do npm install
            execSync(`cd ${projectPath} && npm install --quiet `, { stdio: [0, 1, 2] });
            console.log(colors.green('Npm packages installed'));

            // Build application
            execSync(`cd ${projectPath} && npm run build `, { stdio: [0, 1, 2] });
            console.log(colors.green('Application has been built'));
        } catch (error) {
            console.log(colors.red('Error occured during npm install, detailed information below'));
            console.log(colors.red(error));
        }

        console.log('');
        console.log('');
        console.log('');
        console.log(colors.blue('Your application is ready, have a nice day!'));
        console.log(colors.blue('You now can run it now'));
        console.log(colors.blue(`cd ${projectPath} ; npm run serve`));
        console.log('');
        console.log('');
        console.log('');
    });

// Parse cli arguments
program.parse(process.argv);
