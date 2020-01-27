import { Context } from 'koa';
import createSitemap, { EnumChangefreq } from 'sitemap';

const createNewSitemap = (domain: string) =>
  createSitemap({
    hostname: `https://${domain}`,
    cacheTime: 600000,
    urls: [
      { url: '/', changefreq: EnumChangefreq.HOURLY, priority: 1.0 },
      { url: '/wallet', changefreq: EnumChangefreq.WEEKLY, priority: 0.9 },
      { url: '/wallet/faq', changefreq: EnumChangefreq.WEEKLY, priority: 0.8 },
      { url: '/browse/block/1', changefreq: EnumChangefreq.HOURLY, priority: 0.7 },
      { url: '/browse/tx/1', changefreq: EnumChangefreq.HOURLY, priority: 0.7 },
      { url: '/browse/address/1', changefreq: EnumChangefreq.HOURLY, priority: 0.7 },
      { url: '/browse/asset/1', changefreq: EnumChangefreq.WEEKLY, priority: 0.7 },
      { url: '/browse/contract/1', changefreq: EnumChangefreq.WEEKLY, priority: 0.7 },
    ],
  });

export const sitemap = ({ domain }: { readonly domain: string }) => {
  const generatedSitemap = createNewSitemap(domain);

  return {
    type: 'route',
    method: 'get',
    name: 'sitemap',
    path: '/sitemap.xml',
    middleware: async (ctx: Context) => {
      await new Promise<void>((resolve) => {
        ctx.set('Content-Type', 'application/xml');
        ctx.status = 200;
        ctx.body = generatedSitemap.toString();
        resolve();
      });
    },
  };
};
