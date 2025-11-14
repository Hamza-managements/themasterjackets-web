export const setFullFaviconSet = (basePath) => {
  const head = document.head;

  head.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='manifest']")
    .forEach(el => el.remove());

  const links = [
    { rel: "icon", sizes: "16x16", href: `${basePath}/favicon-16x16.png` },
    { rel: "icon", sizes: "32x32", href: `${basePath}/favicon-32x32.png` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${basePath}/apple-touch-icon.png` },
    { rel: "manifest", href: `${basePath}/site.webmanifest` }
  ];

  links.forEach((data) => {
    const link = document.createElement("link");
    Object.entries(data).forEach(([key, value]) => link.setAttribute(key, value));
    head.appendChild(link);
  });
};
