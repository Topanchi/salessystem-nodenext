export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  storage: {
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE, 10) || 10485760,
    allowedMimeTypes: process.env.STORAGE_ALLOWED_MIMETYPES?.split(',') || ['application/pdf'],
  },
});