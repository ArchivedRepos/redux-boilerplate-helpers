import parseArgs from 'minimist';
import addReduxActions from './fileOperations';

const argv = parseArgs(process.argv.slice(2), {
  boolean: ['dry', 'semi', 'use-tabs', 'single0quote', 'bracket-spacing', 'verbose'],
  number: ['print-width', 'tab-width'],
  string: ['dir', 'trailing-comma'],
  default: {
    dir: './',
    semi: true,
    'bracket-spacing': true,
  },
});

// eslint-disable-next-line no-shadow
const getOptions = argv => ({
  dry: argv.dry,
  prettier: {
    printWidth: argv['print-width'],
    tabWidth: argv['tab-width'],
    useTabs: argv['use-tabs'],
    semi: argv.semi,
    singleQuote: argv['single-quote'],
    trailingComma: argv['trailing-comma'],
    bracketSpacing: argv['bracket-spacing'],
  },
});

addReduxActions(argv.dir, argv._, getOptions(argv));
