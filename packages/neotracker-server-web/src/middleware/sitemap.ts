import { Context } from 'koa';
// @ts-ignore
import sm from 'sitemap';

const createSitemap = (domain: string) =>
  sm.createSitemap({
    hostname: `https://${domain}`,
    cacheTime: 600000,
    urls: [
      { url: '/', changefreq: 'hourly', priority: 1.0 },
      { url: '/wallet', changefreq: 'weekly', prioriy: 0.9 },
      { url: '/wallet/faq', changefreq: 'weekly', prioriy: 0.8 },
      { url: '/browse/block/1', changefreq: 'hourly', prioriy: 0.7 },
      { url: '/browse/tx/1', changefreq: 'hourly', prioriy: 0.7 },
      { url: '/browse/address/1', changefreq: 'hourly', prioriy: 0.7 },
      { url: '/browse/asset/1', changefreq: 'weekly', prioriy: 0.7 },
      { url: '/browse/contract/1', changefreq: 'weekly', prioriy: 0.7 },
    ],
  });

export const sitemap = ({ domain }: { readonly domain: string }) => {
  const generatedSitemap = createSitemap(domain);

  return {
    type: 'route',
    method: 'get',
    name: 'sitemap',
    path: '/sitemap.xml',
    middleware: async (ctx: Context) => {
      ctx.set('Content-Type', 'application/xml');
      ctx.status = 200;
      ctx.body = generatedSitemap.toString();
    },
  };
};
