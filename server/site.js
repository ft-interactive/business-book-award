var site = {
  name: process.env.SITE_NAME || "Best business books",
  baseurl: {
    static: process.env.STATIC_BASE ? process.env.STATIC_BASE : "",
    pages: process.env.PAGES_BASE || "",
    ft: process.env.FT_HOME || "http://www.ft.com/",
    api: process.env.API_BASE || "",
  },
  relatedContentList: process.env.RELATED_CONTENT_LIST || null,
};

module.exports = site;
