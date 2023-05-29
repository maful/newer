const path = require("path");
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const htmlmin = require('html-minifier');
const svgContents = require("eleventy-plugin-svg-contents");
const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

async function imageShortcode(src, alt, options = {}) {
  const sizes = options.sizes || "100vw";
  const widths = options.widths || [400, 800, 1280];
  const formats = options.formats || ["webp", "jpeg", "svg"];

  const metadata = await Image(src, {
    hashLength: 15,
    widths: [...widths, null],
    formats: [...formats, null],
    outputDir: 'public/assets/images',
    urlPath: '/assets/images',
    filenameFormat: function (hash, src, width, format, options) {
      return `${hash}-${width}w.${format}`;
    }
  });

  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Customize Markdown library and settings:
  const markdownLibrary = markdownIt({
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#"
    }),
    level: [1,2,3,4],
    slugify: eleventyConfig.getFilter("slugify")
  }).use(markdownItEleventyImg, {
    imgOptions: {
      urlPath: "/assets/images/",
      outputDir: path.join("public", "assets", "images"),
      widths: [400, 800, 1280, null],
      formats: ["webp", "jpeg", null],
      hashLength: 15,
      filenameFormat: function (hash, src, width, format, options) {
        return `${hash}-${width}w.${format}`;
      }
    },
    globalAttributes: {
      sizes: "100vw"
    }
  });
  eleventyConfig.setLibrary('md', markdownLibrary)

  eleventyConfig.addPlugin(svgContents);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addWatchTarget('./src/css/');
  eleventyConfig.addPassthroughCopy("src/assets/favicon");
  eleventyConfig.addPassthroughCopy("src/assets/og");
  eleventyConfig.addPassthroughCopy("src/assets/cv.pdf");
  eleventyConfig.setUseGitIgnore(false);

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toLocaleString(DateTime.DATE_FULL);
  });
  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })
      return minified
    }

    return content;
  });

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['html', 'md', 'njk'],
    dir: {
      input: 'src',
      output: 'public'
    }
  }
};
