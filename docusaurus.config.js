// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Polar Signals - Documentation",
  tagline:
    "Documentation for the Polar Signals cloud product. Continuous profiling for every codebase",
  url: "https://polarsignals.com/",
  baseUrl: "/docs/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/polarsignals/docs/edit/main/",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    require.resolve("./docusaurus-github-releases-plugin/src/index.js"),
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "",
        logo: {
          alt: "Polar Signals Logo",
          src: "img/logo.svg",
          srcDark: "img/logo-dark.svg",
        },
        items: [
          {
            type: "doc",
            docId: "overview",
            position: "left",
            label: "Documentation",
          },
          {
            href: "https://github.com/polarsignals/docs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Overview",
                to: "/docs/overview",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/polarsignals",
              },
              {
                label: "Discord",
                href: "https://discord.gg/knw3u5X9bs",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/PolarSignalsIO",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                href: "https://www.polarsignals.com/blog/",
              },
              {
                label: "About Us",
                href: "https://www.polarsignals.com/about-us/",
              },
              {
                label: "Careers",
                href: "https://www.polarsignals.com/working-at-polar-signals/",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Polar Signals. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'FFBMHX41FH',

        // Public API key: it is safe to commit it
        apiKey: 'a2796eeece1c80a81df8cdf7834de128',

        indexName: 'polarsignals',

        contextualSearch: false,
      },
    }),
};

module.exports = config;
