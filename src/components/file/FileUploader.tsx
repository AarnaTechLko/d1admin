const FileUploader = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
      <p className="text-sm text-gray-600">
        Please wait, file is being uploaded...
      </p>
    </div>
  );
};

export default FileUploader;
