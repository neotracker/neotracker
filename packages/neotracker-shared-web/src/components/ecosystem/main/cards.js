const cards = [
  {
    title: 'Neo',
    description:
      'Neo is an open-source, community driven platform that is leveraging the intrinsic advantages of blockchain technology to realize the optimized digital world of the future.',
    link: 'https://neo.org/',
    image: 'neo_dark.svg',
    cover: true,
  },
  {
    title: 'NEO•ONE',
    description:
      'NEO•ONE is the One for easy, fast, & fun Neo blockchain development. NEO•ONE makes coding, testing and deploying Neo dapps easy, fast, efficient and enjoyable.',
    link: 'https://neo-one.io',
    image: 'neo_one.png',
    cover: true,
  },
  {
    title: 'Neo News Today',
    description:
      "Neo News Today brings you all the latest news on the Neo blockchain project. No matter how you like to consume your news, Neo News Today has an option that's right for you.",
    link: 'https://neonewstoday.com/',
    image: 'neo_news_today.jpg',
    cover: true,
  },
  {
    title: 'City of Zion',
    description:
      'City of Zion is a global, independent group of over 50 open source developers, designers and translators formed to support the Neo core and ecosystem. Contributors are rewarded weekly with NEO.',
    link: 'https://cityofzion.io/',
    image: 'city_of_zion.png',
    cover: true,
  },
  {
    title: 'NeoResearch',
    description:
      'NeoResearch is an open-source community focused on developing cutting-edge technologies for the Neo blockchain. NeoResearch is passionate group of people crazy for blockchain technology and the Smart Economy revolution.',
    link: 'https://neoresearch.io/',
    image: 'neo_research.png',
    cover: true,
  },
  {
    title: 'Neo SPCC',
    description:
      'Neo Saint Petersburg Competence Center is a Saint Petersburg-based R&D company that provides support for Neo core development. NSPCC is creating NeoFS to allow data transfer and storage on Neo.',
    link: 'https://www.nspcc.ru/en/',
    image: 'neo_spcc.png',
    cover: false,
  },
  {
    title: 'Nash',
    description:
      'Nash is a fast and user-friendly non-custodial exchange. Nash gives you sipmle, secure access to fund management tools for Bitcoin, Ethereum, and Neo.',
    link: 'https://nash.io/',
    image: 'nash_png.png',
    cover: false,
  },
  {
    title: 'Switcheo Network',
    description:
      'Switcheo is a decentralized cryptocurrency exchange. Switcheo paves the way for a trustless and secure multi-chain trading experience. No mandatory registration. Connect and trade freely.',
    link: 'https://switcheo.network/',
    image: 'switcheo.png',
    cover: true,
  },
  {
    title: 'Moonlight',
    description:
      'Moonlight is a decentralized workforce and project management platform anchored on the Neo blockchain. Moonlight will change the way you recruit and scale your workforce.',
    link: 'https://moonlight.io/',
    image: 'moonlight.png',
    cover: true,
  },
  {
    title: 'Neo Name Service',
    description:
      'NNS is a distributed, open-source and extensible naming system based on the Neo blockchain, which offers a secure and decentralized way to address resources both on and off the blockchain.',
    link: 'https://neons.name/index_En.html',
    image: 'nns.png',
    cover: false,
  },
  {
    title: 'New Economy Labs',
    description:
      'New Economy Labs ia a China-based community of open-source developers supporting the Neo ecosystem.',
    link: 'https://nel.group/',
    image: 'new_economy_labs.png',
    cover: false,
  },
  {
    title: 'Bridge Protocol',
    description:
      'Bridge Protocol provides secure, digital identity on the blockchain. Bridge Protocol facilitates interaction between Bridge Users, Trusted Verification Partners and integrated Network Partners.',
    link: 'https://bridgeprotocol.io/',
    image: 'bridge.jpeg',
    cover: true,
  },
  {
    title: 'DeepBrain Chain',
    description:
      'DeepBrain Chain is a decentralized neural network. Nodes across the world supply computational power to AI companies and receive DBC tokens as a reward. The DBC token is traded via smart contracts on the Neo blockchain.',
    link: 'https://www.deepbrainchain.org/',
    image: 'deepbrain_chain.jpg',
    cover: true,
  },
  {
    title: 'Alchemint',
    description:
      'Alchemint is a platform for issuing stablecoins. Alchemint has issued the dollar-pegged stablecoin, SDUSD, on the Neo blockchain, with plans to launch more stablecoins in the future.',
    link: 'https://alchemint.io/#/home',
    image: 'alchemint.png',
    cover: false,
  },
  {
    title: 'HashPuppies',
    description:
      'HashPuppies is a virtual pet trading game on the Neo blockchain. HashPuppies is a fully 3D, interactive crypto-collectible game. Collect, breed, and raise virtual puppies!',
    link: 'https://hashpuppi.es/',
    image: 'hashpuppies.jpg',
    cover: false,
  },
  {
    title: 'For The Win',
    description:
      'FTW is a decentralized gambling platform on the Neo blockchain. FTW aims to rectify the shortcomings in the traditional lottery system in which the participation is limited and most funds are used in maintaining administrative costs.',
    link: 'https://www.ftwcoin.io/',
    image: 'ftw.png',
    cover: true,
  },
  {
    title: 'nOS',
    description:
      'nOS is an all-in-one platform that introduces new business models powered by blockchain technologies. With nOS you can access the crypto-powered web, discover or create apps using blockchains and cryptocurrencies.',
    link: 'https://nos.io/',
    image: 'nos.png',
    cover: true,
  },
  {
    title: 'Master Contract Token',
    description:
      'MCT is a utility token for the Neo Smart Economy. MCT is a NEP-5-compatible token implementation with some additional features. The most notable being the ability for third-party smart contracts to send, receive, and hold it.',
    link: 'https://github.com/Splyse/MCT',
    image: 'master_contract_token.png',
    cover: false,
  },
  {
    title: 'imusify',
    description:
      'Imusify is a City of Zion music platform that integrates the best of crowdfunding, streaming, media sharing, and social networks to create an ecosystem, in which the artist, fans, and other stakeholders can interact peer-to-peer.',
    link: 'https://imusify.com/',
    image: 'imusify.png',
    cover: true,
  },
  {
    title: 'Red Pulse',
    description:
      "Red Pulse is a market intelligence platform covering China's economy and capital markets. Red Pulse connects industry experts, practitioners, and professionals to share their insights with a global audience.",
    link: 'https://www.redpulse.com/',
    image: 'red_pulse.png',
    cover: false,
  },
  {
    title: 'THEKEY',
    description:
      'THEKEY is a decentralized ecosystem of identity verification using national big data and blockchain.',
    link: 'https://www.thekey.vip/#/homePage',
    image: 'thekey.png',
    cover: true,
  },
  {
    title: 'Travala',
    description:
      'Travala is creating smart travel for the smart economy. A travel booking marketplace with 0% commission fees. The platform is powered by the NEP-5 token AVA which provides utility to the multilayer aspects of the platform.',
    link: 'https://travala.com/',
    image: 'travala.png',
    cover: true,
  },
  {
    title: 'Trinity',
    description:
      'Trinity is a universal off-chain scaling solution which aims to achieve real-time payments with low transaction fees, high transaction throughput, and privacy protection for Neo.',
    link: 'https://trinity.tech/#/',
    image: 'trinity.png',
    cover: false,
  },
];

export default cards;
