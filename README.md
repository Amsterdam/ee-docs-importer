# Engineering Enablement React Template

Team responsible: Engineering Enablement team

## Aims of this repo

To produce a Node.js command that copies and save valid markdown documents from the [development-standards repository](https://github.com/Amsterdam/development-standards).

## Features

This repo uses the [ee-react-template](https://github.com/Amsterdam/ee-react-template/) project template. Any frontend features have been removed.

### Usage

The starter contains the following scripts:

- `import [dir]` - starts the import; [dir] is optional, replace it with your directory of choice, otherwise it defaults to `docs`
- `build` - generates the production bundle
- `test` - starts vitest and runs all tests
- `test:coverage` - starts vitest and run all tests with code coverage report
- `lint:scripts` - lint `.ts`, `.tsx` and `.json` files with eslint
- `format:scripts` - format `.ts`, `.html` and `.json` files with prettier
- `format` - format all with prettier
- `prepare` - script for setting up husky pre-commit hook
- `uninstall-husky` - script for removing husky from repository

## How to contribute to this repo?

Simply create and submit a pull request. You can also contact us via Teams (DV - Engineering Enablement) or Slack (#engineering-enablement).

### Updating

To update the package:

1. Run `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`
  *(Usually `minor` or `patch` is sufficient; `npm version minor` - bumps `0.1.0` to `0.2.0`; `npm patch` bumps `0.1.0` to `0.1.1`)*
2. Push the new version (`git push origin <branch-name>`) and new tag (`git push origin tag <tag_name>`).
3. Publish a [new GitHub release](https://github.com/Amsterdam/ee-docs-importer/releases/new).

## Acknowledgments

[Original template repo](https://github.com/kbysiec/vite-vanilla-ts-lib-starter)
