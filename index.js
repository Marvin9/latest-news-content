const koa = require('koa'),
      app = new koa(),
      Pug = require('koa-pug'),
      serve = require('koa-static');

const db = require('./server/database/_database');
const routers = require('./server/routes');
const pug = new Pug({
    viewPath : './client/views',
    basedir : './client',
    app : app
});

app.use(serve(__dirname + '/client'));
app.use(routers.routes());

const PORT = process.env.PORT || 8000;

app.listen(PORT, function(){
    console.log("Server running at : ", PORT);
});
