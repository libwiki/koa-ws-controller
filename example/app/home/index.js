module.exports=class{
    constructor(ctx){
        ctx.state.url=this.url
    }
    async test(ctx) {
        console.log(this.path())
        ctx.render(this.path())
        return false
    }
    async __before(ctx){
        console.log('__before')
    }
    
    async index(ctx){
        console.log('home/index/index.html')
        this.myfun();
        ctx.body={
            path:this.path(),
            isPost:this.isPost(),
            myfun: this.myfun,
            url0:this.url(),
            url1:this.url('index'),
            url2:this.url('index',{name:'joy',age:18}),
            url3: this.url('contro/index', { name: 'joy', age: 18 }),
            url4: this.url('/contro/index', { name: 'joy', age: 18 }),
            url5: this.url('home/contro/index', { name: 'joy', age: 18 }),
            url6: this.url('/home/contro/index', { name: 'joy', age: 18 }),
            url7: this.url('/home/contro/index', { name: 'joy', age: 18 },'.php'),
            url8: this.url('/home/contro/index.ejs', { name: 'joy', age: 18 },'.php'),
            url9: this.url('/home/contro/index?sex=1', { name: 'joy', age: 18 },'.php'),
            url10: this.url('/home/contro/index.html?sex=1', { name: 'joy', age: 18 },'.php'),
            url11: this.url('/home/contro/index.html?sex=1', 'a=133&b=222','.php'),
            url12: this.url('/home/contro/index.html?sex=1', 'a=133&b=222', '.php', true),
        };
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