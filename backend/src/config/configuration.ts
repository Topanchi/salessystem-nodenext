export default () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    database: {
      url: isProduction ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    storage: {
      localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
      maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '10485760', 10),
      allowedMimeTypes: process.env.STORAGE_ALLOWED_MIMETYPES?.split(',') || ['application/pdf'],
    },
  };
};