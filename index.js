const path=require('path')
const h=require('ws-helpers')
const runAction=Symbol('runAction')
const runAction2=Symbol('runAction')
const parseModules=Symbol('parseModules')
const _keys=['action','controller','module'];
module.exports = class{
    constructor(options={}){
        if(!options.appPath){
            throw new TypeError('appPath is undefined');
        }
        if(!path.isAbsolute(options.appPath))options.appPath=path.join(__dirname,options.appPath);
        if(!h.isExist(options.appPath)){
            throw new Error('Directory does not exist: '+options.appPath);
        }
        this.options=Object.assign({
            appPath:'',
            [_keys[2]]:'home',
            [_keys[1]]:'index',
            [_keys[0]]:'index',
        },options);
        return this[runAction]()
    }
    static parseRoute(ctx,path,next){
        if(path&&typeof path==='string'){
            let pathArr=path.split('/')
            if(path.startsWith('/'))pathArr.shift();
            pathArr=pathArr.slice(0,3)
            let index=0;
            while(pathArr.length){
                let name=pathArr.pop();
                if(name)ctx[_keys[index]]=name;
                index++;
            }
            
        }
        if(typeof next==='function'){
            return next()
        }
    }
    [runAction](){
        const options=this.options;
        return async (ctx,next)=>{
            if(!ctx.module)ctx.module=options.module;
            if(!ctx.controller)ctx.controller=options.controller;
            if(!ctx.action)ctx.action=options.action;
            const modules=await this[parseModules](options.appPath).catch(err=>{throw err});
            let controllers=modules[ctx.module] || {};
            let C=controllers[ctx.controller];
            await next();
            if(!C) Promise.resolve();
            let instance=new C(ctx),
                promise=Promise.resolve();
            if (instance.__before) {
                promise = Promise.resolve(instance.__before(ctx,next));
            }
            
            return promise.then(data => {
                if (data === false) return false;
                let method = `${ctx.action}`;
                if (!instance[method]) {
                  method = '__call';
                }
                if (instance[method]) {
                  return instance[method](ctx,next);
                }
            }).then(data => {
                if (data === false) return false;
                if (instance.__after) return instance.__after(ctx,next);
            })
        }
    }
    [runAction2](){
        const options=this.options;
        return async (ctx,next)=>{
            if(!ctx.module)ctx.module=options.module;
            if(!ctx.controller)ctx.controller=options.controller;
            if(!ctx.action)ctx.action=options.action;
            const modules=await this[parseModules]('./app').catch(err=>{throw err});
            let controllers=modules[ctx.module] || {};
            let C=controllers[ctx.controller];
            if(!C) return next();
            let instance=new C(ctx);
            let promise=Promise.resolve();
            if (instance.__before) {
                promise = Promise.resolve(instance.__before(ctx,next));
            }
            return promise.then(data => {
                if (data === false) return false;
                let method = `${ctx.action}`;
                if (!instance[method]) {
                  method = '__call';
                }
                if (instance[method]) {
                  return instance[method](ctx,next);
                }
            }).then(data => {
                if (data === false) return false;
                if (instance.__after) return instance.__after(ctx,next);
            }).then(data => {
                if (data !== false) return next();
            });
        }
    }
    /**
     * 获取模块下所有类的引用
     */
    async [parseModules](appPath,controllerName) {
        if (!controllerName){
            if (!h.isExist(appPath)) return Promise.resolve({});
            let res = await h.readdir(appPath, false).catch(err => {throw err})
            if (!res.dir) {
                return Promise.resolve({});
            }
            controllerName=res.dir;
        }
        let p = [], dirs = [];
        if (Array.isArray(controllerName)){
            controllerName.forEach(dir => {
                dirs.push(dir);
                p.push(h.readdir(path.join(appPath, dir), false));
            })
        }else{
            dirs = [controllerName];
            p=[h.readdir(path.join(appPath, controllerName), false)];
        }
        
        let files = {},
            res = await Promise.all(p).catch(err => {});
            res.forEach((v, i) => {
                if(v.dir){
                    this.parseModules(v.filePath,v.dir)
                }
                if (v.file) {
                    let item = {};
                    
                v.file.forEach(f => {
                    let extname=path.extname(f);
                    if(extname!=='.js')return;
                    let Controller=require(path.resolve(v.filePath, f));
                    if(typeof Controller!=='function')return;
                    item[path.basename(f, extname)] = Controller;
                    // item[path.basename(f, extname)] = path.join(v.filePath, f);
                })
                files[dirs[i]] = item;
            }
        })
        return Promise.resolve(files);

    }
}

