var site = {
  name: 'Business book of the year',
  baseurl: {
    static: process.env.STATIC_BASE ? process.env.STATIC_BASE : '/',
    site: process.env.BASE_URL || '';
    ft: '//www.ft.com/'
  }
};

module.exports = site;
