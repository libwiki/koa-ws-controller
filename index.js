const path=require('path')
const h=require('ws-helpers')
const runAction=Symbol('runAction')
const parseModules=Symbol('parseModules')
const _keys=['module','controller','action'];
module.exports = class Controller{
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
            auto:true,
            [_keys[0]]:'home',
            [_keys[1]]:'index',
            [_keys[2]]:'index',
        },options);
        return this[runAction]()
    }
    static autoMatch(ctx,pathStr){
        pathStr=pathStr || ctx.path;
        if(pathStr&&typeof pathStr==='string'){           
            let pathArr=pathStr.split('/')
            if(pathStr.startsWith('/'))pathArr.shift();
            pathArr=pathArr.slice(0,3)
            let index=0;
            while(pathArr.length){
                if(ctx[_keys[index]])break;
                let name=pathArr.shift();
                if(name&&!ctx[_keys[index]])ctx[_keys[index]]=name;
                index++;
            }
            //console.log('autoMatch:',ctx.module,ctx.controller,ctx.action)
        }
    }
    static setRouter(pathStr){
        return async (ctx,next)=>{
            Controller.autoMatch(ctx,pathStr)
            await next();
        }
    }
    static extname(){
        return async (ctx,next)=>{
            let extlength=path.extname(ctx.path).length;
            if(extlength)ctx.path=ctx.path.slice(0,ctx.path.length-extlength);
            await next();
        }
    }
    [runAction](){
        const options=this.options;
        return async (ctx,next)=>{
            const modules=await this[parseModules](options.appPath).catch(err=>{throw err});
            await next();
            if(options.auto)Controller.autoMatch(ctx);
            if(!ctx.module)ctx.module=options.module;
            if(!ctx.controller)ctx.controller=options.controller;
            if(!ctx.action)ctx.action=options.action;

            let controllers=modules[ctx.module] || {};
            let C=controllers[ctx.controller];
            if(!C) return Promise.resolve();
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

