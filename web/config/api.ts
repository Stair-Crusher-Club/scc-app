import {DefaultApi, Configuration} from '@/generated-sources/openapi';

// API configuration
const apiConfig = new Configuration({
  basePath: 'http://localhost:8080',
});

export const api = new DefaultApi(apiConfig);
export {apiConfig};
