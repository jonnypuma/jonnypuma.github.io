# jonnypuma showcase site

A static page (plain HTML, CSS and JavaScript, no build step) that presents the Kodi add-ons and Docker apps of
[github.com/jonnypuma](https://github.com/jonnypuma).

- `index.html`: the page. Project pages open at `#/<project id>`.
- `js/projects.js`: every project's texts, screenshots and links. Edit this file to change the content.
- `js/site.js`: renders the cards and project pages. Add-on versions are read live from the Skippy Repo's
  `addons.xml`; the versions in `projects.js` are the fallback.
- `assets/<project id>/`: icon, fanart and screenshots, copied from each project and saved as WebP.

