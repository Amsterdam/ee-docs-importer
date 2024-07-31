const getCommandArgs = () => {
  const args = process.argv.slice(2);
  return args;
};

export default getCommandArgs;
