import getCommandArgs from '../node/getCommandArgs';

const getLocalDirectoryPath = () => {
  const commandArgs = getCommandArgs();

  return commandArgs.length && typeof commandArgs[0] === 'string'
    ? commandArgs[0]
    : 'docs';
};

export default getLocalDirectoryPath;
