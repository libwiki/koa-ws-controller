const Koa=require('koa')
const path=require('path')
const Router=require('koa-router')
const Controller=require('../index')
const parseRoute=Controller.parseRoute
const app=new Koa();
const router=new Router();
const router2=new Router();
router2.get('/controller',(ctx,next)=>{
    parseRoute(ctx,ctx.path)
    return next();
})
router2.get('/index',async (ctx,next)=>{
    await parseRoute(ctx,ctx.path,next)
    console.log(ctx.module,ctx.controller,ctx.action)
})
router.use('/user',router2.routes())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(new Controller({appPath:path.join(__dirname,'./app')}))
app.use(async (ctx,next)=>{
    ctx.aaa='aaaaaaaaaaa'
    await next()
})
router.get('/',(ctx,next)=>{
    console.log(router)
    ctx.controller='user'
    return next();
})
app.listen(3030)