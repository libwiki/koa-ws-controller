module.exports=class{
    constructor(ctx){
        console.ctx
    }
    async __before(ctx){
        console.log('__before')
    }
    async index(ctx){
        console.log('home/index/index.html')
        ctx.body='home/index/index.html';
        return true;
    }
    async __after(ctx){
        console.log('__after')
    }
    async __call(ctx){
        console.log('__call')
        ctx.body='not action';
    }
}