export const handleDuplicateError = (err: any) => {
  const match = err.message.match(/"([^"]*)"/);
  const value = match?.[1];

  return {
    statusCode: 400,
    message: 'Duplicate Field Error',
    errorSources: [
      {
        path: '',
        message: `${value} already exists`,
      },
    ],
  };
};
