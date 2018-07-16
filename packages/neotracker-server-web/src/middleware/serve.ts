// tslint:disable
// Taken from koa-static with the addition of the immutable header
import createError from 'http-errors';
import * as fs from 'fs-extra';
import { basename, extname, normalize, parse, resolve, sep } from 'path';
import resolvePath from 'resolve-path';

const BR = '.br';
const GZ = '.gz';

/**
 * Module dependencies.
 */

/**
 * Send file at `path` with the
 * given `options` to the koa `ctx`.
 *
 * @param {Context} ctx
 * @param {String} path
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

async function send(ctx: any, path: any, opts: any = {}) {
  // options
  const root = opts.root ? normalize(resolve(opts.root)) : '';
  const trailingSlash = path[path.length - 1] === '/';
  path = path.substr(parse(path).root.length);
  const index = opts.index;
  const maxage = opts.maxage || opts.maxAge || 0;
  const immutable = opts.immutable || false;
  const hidden = opts.hidden || false;
  const format = opts.format !== false;
  const extensions = Array.isArray(opts.extensions) ? opts.extensions : false;
  const brotli = opts.brotli !== false;
  const gzip = opts.gzip !== false;
  const setHeaders = opts.setHeaders;
  const pub = opts.public || false;

  if (setHeaders && typeof setHeaders !== 'function') {
    throw new TypeError('option setHeaders must be function');
  }

  // normalize path
  path = decode(path);

  if (path === -1) {
    return ctx.throw(400, 'failed to decode');
  }

  // index file support
  if (index && trailingSlash) {
    path += index;
  }

  path = resolvePath(root, path);

  // hidden file support, ignore
  if (!hidden && isHidden(root, path)) {
    return;
  }

  // serve brotli file when possible otherwise gzipped file when possible
  let encodingExt = '';
  if (ctx.acceptsEncodings('br', 'deflate', 'identity') === 'br' && brotli && (await fs.pathExists(path + BR))) {
    path = path + BR;
    ctx.set('Content-Encoding', 'br');
    ctx.res.removeHeader('Content-Length');
    encodingExt = BR;
  } else if (
    ctx.acceptsEncodings('gzip', 'deflate', 'identity') === 'gzip' &&
    gzip &&
    (await fs.pathExists(path + GZ))
  ) {
    path = path + GZ;
    ctx.set('Content-Encoding', 'gzip');
    ctx.res.removeHeader('Content-Length');
    encodingExt = GZ;
  }

  if (extensions && !/\..*$/.exec(path)) {
    const list = [].concat(extensions);
    for (let i = 0; i < list.length; i++) {
      let ext: any = list[i];
      if (typeof ext !== 'string') {
        throw new TypeError('option extensions must be array of strings or false');
      }
      if (!/^\./.exec(ext)) {
        ext = '.' + ext;
      }
      if (await fs.pathExists(path + ext)) {
        path = path + ext;
        break;
      }
    }
  }

  // stat
  let stats;
  try {
    stats = await fs.stat(path);

    // Format the path to serve static file servers
    // and not require a trailing slash for directories,
    // so that you can do both `/directory` and `/directory/`
    if (stats.isDirectory()) {
      if (format && index) {
        path += '/' + index;
        stats = await fs.stat(path);
      } else {
        return;
      }
    }
  } catch (err) {
    const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
    if (notfound.includes(err.code)) {
      throw createError(404, err);
    }
    err.status = 500;
    throw err;
  }

  if (setHeaders) {
    setHeaders(ctx.res, path, stats);
  }

  // stream
  ctx.set('Content-Length', stats.size);
  if (!ctx.response.get('Last-Modified')) {
    ctx.set('Last-Modified', stats.mtime.toUTCString());
  }
  if (!ctx.response.get('Cache-Control')) {
    const directives = ['max-age=' + ((maxage / 1000) | 0)];
    if (immutable) {
      directives.push('immutable');
    }
    if (pub) {
      directives.push('public');
    }
    ctx.set('Cache-Control', directives.join(','));
  }
  ctx.type = type(path, encodingExt);
  ctx.body = fs.createReadStream(path);

  return path;
}

/**
 * Check if it's hidden.
 */

function isHidden(root: any, path: any) {
  path = path.substr(root.length).split(sep);
  for (let i = 0; i < path.length; i++) {
    if (path[i][0] === '.') {
      return true;
    }
  }
  return false;
}

/**
 * File type.
 */

function type(file: string, ext: any) {
  return ext !== '' ? extname(basename(file, ext)) : extname(file);
}

/**
 * Decode `path`.
 */

function decode(path: any) {
  try {
    return decodeURIComponent(path);
  } catch (err) {
    return -1;
  }
}

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

export function serve(root: any, opts: any) {
  opts = opts || {};

  // options
  opts.root = resolve(root);
  if (opts.index !== false) {
    opts.index = opts.index || 'index.html';
  }

  if (!opts.defer) {
    return async function(ctx: any, next: any) {
      let done = false;

      if (ctx.method === 'HEAD' || ctx.method === 'GET') {
        try {
          done = await send(ctx, `${ctx.path.slice((opts.prefix || '').length)}`, opts);
        } catch (err) {
          if (err.status !== 404) {
            throw err;
          }
        }
      }

      if (!done) {
        await next();
      }
    };
  }

  return async function(ctx: any, next: any) {
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return;
    }
    // response is already handled
    if (ctx.body != undefined || ctx.status !== 404) {
      return;
    } // eslint-disable-line

    try {
      await send(ctx, ctx.path, opts);
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
  };
}
