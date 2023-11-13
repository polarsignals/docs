/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually

  tutorialSidebar: [
    {
      type: "doc",
      label: "Overview",
      id: "overview",
    },
    {
      type: "doc",
      label: "Why Polar Signals?",
      id: "why-polar-signals",
    },
    {
      type: "doc",
      label: "Security Posture",
      id: "security-posture",
    },
    {
      type: "doc",
      label: "Contact Support",
      id: "contact-support",
    },
    {
      type: "category",
      label: "Concepts",
      items: [
        "what-is-continuous-profiling",
        "profiling-101",
        "organizations-and-projects",
      ],
    },
    {
      type: "category",
      label: "Language Support",
      items: ["nodejs", "c", "cpp", "rust", "go", "erlang", "julia", "dotnet", "python", "ruby", "jvm", "graal-native", "php"],
    },
    {
      type: "category",
      label: "Features",
      items: ["filter-by-function", "graph-tooltip-details"],
    },
    {
      type: "category",
      label: "Tutorial",
      items: [
        "setup-collection-kubernetes",
        "setup-collection-docker",
        "invite-users",
        "generating-tokens",
        "uploading-debuginfos",
        "troubleshooting-agent",
        "upload-source",
        "install-parca-debuginfo",
        "install-parca-push",
        "setup-scraper",
        "filter-data-send",
      ],
    },
  ],
};

module.exports = sidebars;
