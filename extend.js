const qs = require('querystring')
const path = require('path')
module.exports=ctx=>{
    return {
        url(url='', query={}, suffix = '.html',domain=false) {
            url = '/' + pathBuild(ctx,url || '');
            if (toString.call(query) === '[object Object]'){
                query = qs.stringify(query)
            }
            if (typeof query !=='string'){
                query='';
            }
            let res='';
            if(url.indexOf('?')===-1){
                if (path.extname(url).length) suffix='';
                res=url + suffix;
                if (query.length) res +='?' + query;
            } else if (url.indexOf('?') === url.length-1){
                res = url + query;
            } else{
                res = url.indexOf('&') === 0 ? url + query:url + '&' + query;
            }
            return domain ? ctx.origin+res:res;
        },
        isPost(){
            return ctx.method.toUpperCase()==='POST';
        },
        // home/index/index
        path(url){
            return pathBuild(ctx,url);
        }
    }
}

function pathBuild(ctx, url) {
    let sep = '/';
    if (url && typeof url === 'string') {
        let start = url.indexOf(sep) === 0 ? 1 : 0;
        urlArr = url.split(sep).slice(start, start + 3);
        switch (urlArr.length) {
            case 0:
                urlArr = [ctx.module, ctx.controller, ctx.action];
                break;
            case 1:
                urlArr.unshift(ctx.module, ctx.controller);
                break;
            case 2:
                urlArr.unshift(ctx.module);
                break;
        }
        return urlArr.join(sep)
    }
    return ctx.module + sep + ctx.controller + sep + ctx.action;
}