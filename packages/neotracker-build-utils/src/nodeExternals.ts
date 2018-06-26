import webpackNodeExternals from 'webpack-node-externals';

export const nodeExternals = webpackNodeExternals({
  whitelist: [
    'source-map-support/register',
    /\.(eot|woff|woff2|ttf|otf)$/,
    /\.(svg|png|jpg|jpeg|gif|ico)$/,
    /\.(mp4|mp3|ogg|swf|webp)$/,
    /\.(css|scss|sass|sss|less)$/,
    /.*neotracker.*/,
  ],
});
