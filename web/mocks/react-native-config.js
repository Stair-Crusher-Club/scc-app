// Web mock for react-native-config.
// webpack DefinePlugin injects process.env (merged from ENVFILE/.env.local),
// so Config.* reads the build-time environment on web.
const Config = {...process.env};

export default Config;
