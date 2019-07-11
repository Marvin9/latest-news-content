const koa = require('koa'),
      app = new koa(),
      Pug = require('koa-pug'),
      serve = require('koa-static');

const db = require('./server/database/_database');
const routers = require('./server/routes');
const pug = new Pug({
    viewPath : './client/views',
    basedir : './client',
    app
});

app.use(serve(__dirname + '/client'));
app.use(routers.routes());


app.listen(8000, () => {
    console.log("Server running at : 8000");
});