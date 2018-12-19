const Koa=require('koa')
const path=require('path')
const Controller=require('../index')
const app=new Koa();
app.use(Controller.sliceSuffix()) //去掉 ctx.path的伪静态后缀(必选并且该中间件应该在路由匹配之前)（例：/a/b.html）
app.use(new Controller({
    appPath:path.join(__dirname,'./app'), //模块目录路径 （必选）
    auto:true, //是否自动路由匹配 默认值：true （匹配所有方法 例：post、get......）
    module:'home', //默认模块 默认值：home
    controller:'index', // 默认控制器 默认值：index
    action:'index' //默认方法 默认值：index

}))

// 模块中定义好相应的方法即可进行访问
// 当然如果模块目录中未匹配到的路由也可以额外的匹配
const router=require('koa-router')()
app.use(router.routes()).use(router.allowedMethods())
router.get('/aaa/bbb',Controller.setRouter('home/user'))
app.listen(3030)