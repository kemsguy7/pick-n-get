const config = {
  plugins: {
    '@tailwindcss/postcss': {
      // Disable native optimizations that require Lightning CSS
      optimize: false,
    },
  },
};

export default config;
