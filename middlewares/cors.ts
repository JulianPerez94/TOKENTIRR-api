import Koa from 'koa';
export async function cors(ctx: Koa.Context, next: Koa.Next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  ctx.set(
    'Access-Control-Allow-Methods',
    'POST, GET, PUT, DELETE, OPTIONS, HEAD'
  );
  await next();
}
