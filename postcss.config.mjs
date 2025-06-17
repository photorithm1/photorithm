/**
 * PostCSS configuration file.
 * 
 * This file configures PostCSS plugins for the application:
 * - @tailwindcss/postcss: Processes Tailwind CSS directives
 * 
 * Used for processing CSS with Tailwind CSS in the build pipeline.
 */
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
