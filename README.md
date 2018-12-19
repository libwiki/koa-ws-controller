# koa-ws-controller
koa 多模块控制器(文档、测试类、使用实例待完善)

## 安装
```
npm install --save koa-ws-controller

```

## 引用

```
const Controller=require('koa-ws-controller')
```

## new Controller({}) 使用

```
const Koa=require('koa')
const path=require('path')
const app=new Koa();

//去除 ctx.path的伪静态后缀(必选并且该中间件应该在路由匹配之前)（例：/a/b.html）
app.use(Controller.sliceSuffix()) 

app.use(new Controller({
    appPath:path.join(__dirname,'./app'), //模块目录路径 （必选） 结构如下注解
    extendPath:path.join(__dirname,'./extend.js'), //扩展 控制器的文件路径
    auto:true, //如果需要完全的控制路由，应该将该项设置为 false 自动匹配如果匹配不到依然会使用下列三项的默认值：true
    //所以应该根据实际情况决定是否配置空值
    module:'home', //默认模块 默认值：home
    controller:'index', // 默认控制器 默认值：index
    action:'index' //默认方法 默认值：index
    excludeModule:['common'], //需要排除的模块名称（单个可以是字符串 全小写）
    excludeController: ['common'],//需要排除的控制器名称（单个可以是字符串 全小写）

}))

```

* 模块目录应该有类似如下结构（```path.join(__dirname,'./app')```）：

```
app  部署目录
├─module_name           应用目录
│  ├─controller.js      控制器文件
│  ├─index.js           
│  └─ ...               更多类库
│  
└─ ...                  更多模块


```

## 控制器内置扩展方法

* path() 当前匹配的路径 结合一些模板引擎实现快速的定位模板路径（例：/home/index/index）
* url(url='',query={},suffix='.html',domain=false) 快捷生成路径
* isPost() 是否post提交

## 静态方法

* 1）、```sliceSuffix()``` 返回一个koa中间件。去除url地址的后缀名(ctx.path后缀) 应该在其它中间件之前使用
```


app.use(Controller.sliceSuffix())
```

* 2）、```distribute(pathStr)``` 返回一个用于主动分配url地址或者改变url地址响应的中间件。
    * koa-ws-controller没有区分ctx.method。故此，自动的分配路由并未验证method。
    * 如果需要可结合类似```koa-router```等路由中间件完成以下功能。
    * 或者在某些时候Controller并未实现相应的方法可通过如下```3）```实现路由的响应

```
// router 来源于koa-router （略）
// 1）、get分配
router.get('/home/index', Controller.distribute())

// 2）、post分配
router.post('/home/index', Controller.distribute())
// 3）、改变路由
router.get('/aaa/bbb', Controller.distribute('home/user'))
```
<br>
<br>
