const output = (errors: { [key: string]: string | undefined }) => {
  if (errors) {
    console.error(
      '⛔ The following documents were skipped due to invalid markup:\n'
    );

    for (const value of Object.values(errors)) {
      console.error(value);
    }
  }

  console.log('\x1b[36m', '✅ Docs imported!', '\x1b[0m');
};

export default output;
