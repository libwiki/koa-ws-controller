const Koa=require('koa')
const path=require('path')
const router=require('koa-router')()
const Controller=require('../index')
const app=new Koa();
app.use(Controller.extname())
app.use(new Controller({appPath:path.join(__dirname,'./app')}))
app.use(async (ctx,next)=>{
    ctx.aaa='aaaaaaaaaaa'
    await next()
})
app.use(router.routes()).use(router.allowedMethods())
router.get('/aaa/bbb',async(ctx,next)=>{
    ctx.body={a:1,b:2}
    Controller.autoMatch(ctx,next)
})

app.listen(3030)