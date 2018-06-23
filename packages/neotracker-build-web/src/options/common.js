/* @flow */
import type { ServerOptions } from 'neotracker-server-web';

import { db } from 'neotracker-build-utils';

const userAgents =
  '(Alexabot|Googlebot|Googlebot-Mobile|Googlebot-Image|Googlebot-News|Googlebot-Video|AdsBot-Google|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|Go-http-client|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigabot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|woriobot|yanga|buzzbot|mlbot|yandexbot|yandex.com\\/bots|purebot|Linguee Bot|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis|Screaming Frog SEO Spider|MetaURI|Scrapy|LivelapBot|OpenHoseBot|CapsuleChecker|collection@infegy.com|IstellaBot|DeuSu\\/|betaBot|Cliqzbot\\/|MojeekBot\\/|netEstate NE Crawler|SafeSearch microdata crawler|Gluten Free Crawler\\/|Sonic|Sysomos|Trove|deadlinkchecker|Slack-ImgProxy|Embedly|RankActiveLinkBot|iskanie|SafeDNSBot|SkypeUriPreview|Veoozbot|Slackbot|redditbot|datagnionbot|Google-Adwords-Instant|adbeat_bot|Scanbot|WhatsApp|contxbot|pinterest|electricmonk|GarlikCrawler|BingPreview\\/|vebidoobot|FemtosearchBot|Yahoo Link Preview)';
const whitelistedUserAgents =
  '(Googlebot|Googlebot-Mobile|Googlebot-Image|Googlebot-News|Googlebot-Video|AdsBot-Google|Mediapartners-Google|Google-Adwords-Instant)';
const url = 'http://127.0.0.1:1341';

export default ({
  rpcURL,
  database,
  port,
}: {|
  rpcURL: string,
  database: string,
  port: number,
|}): ServerOptions => {
  const clientBundlePath = './build/client';
  return {
    db: db({ database }),
    rootLoader: {
      cacheEnabled: true,
      cacheSize: 100,
    },
    subscribeProcessedNextIndex: {
      intervalMS: 500,
      db: (db({ database }): $FlowFixMe),
    },
    rateLimit: {
      enabled: true,
      config: {
        rate: 5 * 60, // Allow 5 requests per second
        duration: 60 * 1000, // 60 seconds
        throw: true,
      },
    },
    react: {
      clientAssetsPath: `${clientBundlePath}/assets.json`,
      ssr: {
        enabled: true,
        userAgents,
      },
      rpcURL,
    },
    toobusy: {
      enabled: true,
      userAgents,
      whitelistedUserAgents,
      maxLag: 70,
      smoothingFactor: 1 / 3,
    },
    security: {
      enforceHTTPs: false,
      frameguard: {
        enabled: true,
        action: 'deny',
      },
      cspConfig: {
        enabled: true,
        directives: {
          childSrc: ["'self'"],
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", `ws://localhost:${port}`],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com/'],
          frameSrc: ["'self'"],
          objectSrc: ["'self'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.polyfill.io'],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'blob:',
            'https://fonts.googleapis.com',
          ],
        },
        browserSniff: false,
      },
    },
    clientAssets: {
      path: clientBundlePath,
    },
    publicAssets: {
      path: './packages/src/neotracker-shared-web/public',
    },
    rootAssets: {
      path: './packages/src/neotracker-shared-web/root',
    },
    domain: '127.0.0.1',
    rpcURL,
    server: {
      keepAliveTimeoutMS: 650000,
    },
    appOptions: {
      meta: {
        title: 'NEO Tracker Blockchain Explorer & Wallet',
        name: 'NEO Tracker',
        description:
          'NEO blockchain explorer and wallet. Explore blocks, transactions, addresses and more. Transfer NEO or GAS, claim GAS and more with the web wallet.',
        walletDescription:
          'NEO Tracker Wallet is a light web wallet that lets NEO holders interact ' +
          'with the NEO blockchain. Transfer NEO, GAS or other tokens, claim GAS, ' +
          'print paper wallets and more.',
        social: {
          fb: 'https://www.facebook.com/neotracker.io/',
          twitter: 'https://twitter.com/neotrackerio',
        },
        donateAddress: 'AKDVzYGLczmykdtRaejgvWeZrvdkVEvQ1X',
      },
      url,
      rpcURL,
      maintenance: false,
      disableWalletModify: false,
      // 3 minutes
      confirmLimitMS: 3 * 60 * 1000,
    },
  };
};
