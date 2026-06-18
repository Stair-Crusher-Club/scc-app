// PostCSS config for the web build: compiles the @tailwind directives in
// global.css using the NativeWind preset (from tailwind.config.js) so that the
// className utilities used across the app resolve to real CSS on web.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
