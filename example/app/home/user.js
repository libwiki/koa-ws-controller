module.exports=class{
    index(ctx,next){
        ctx.body='home/user/index.html'
        console.log('home/user/index.html')
    }
}