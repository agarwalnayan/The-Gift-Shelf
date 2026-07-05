const Loader = ({ fullScreen = false }) => {
  const spinner = (
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
  );

  if (fullScreen) {
    return <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>;
  }

  return spinner;
};

export default Loader;
