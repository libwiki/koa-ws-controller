const Koa=require('koa')
const path=require('path')
const router=require('koa-router')()
const Controller=require('../index')
const render = require('koa-art-template')
const app=new Koa();
app.use(Controller.sliceSuffix()) //去掉 ctx.path的伪静态后缀(必选并且该中间件应该在路由匹配之前)（例：/a/b.html）
app.use(router.routes()).use(router.allowedMethods())
app.use(new Controller({
    appPath:path.join(__dirname,'./app'), //模块目录路径 （必选）
    extendPath: path.join(__dirname,'./controllerExtend.js'), //模块目录路径 （必选）
    auto:false, //如果需要完全的控制路由，应该将该项设置为 false 自动匹配如果匹配不到依然会使用下列三项的默认值。
    //所以应该根据实际情况决定是否配置空值
    module:'', //默认模块 默认值：home
    controller:'', // 默认控制器 默认值：index
    action:'index' //默认方法 默认值：index

}))

// 如果需要控制对应的请求方法或者路径变换可结合 koa-router等路由中间件实现

// 1）、get分配
router.get('/home/index', Controller.distribute())

// 2）、post分配
router.post('/home/index', Controller.distribute())
// 3）、改变路由
router.get('/aaa/bbb', Controller.distribute('home/user'))


// 
router.get('/home/index/test', Controller.distribute())
render(app, {
    root: path.join(__dirname, "/views"),
    extname: ".html",
    debug: process.env.NODE_ENV !== 'production'
})
app.listen(3030)