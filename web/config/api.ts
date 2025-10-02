import {DefaultApi, Configuration} from '@/generated-sources/openapi';

// API configuration
const apiConfig = new Configuration({
  basePath: 'https://api.staircrusher.club',
});

export const api = new DefaultApi(apiConfig);
export {apiConfig};
