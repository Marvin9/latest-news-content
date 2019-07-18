const koa_router = require('koa-router');
const db = require('./database/_database');
const router = new koa_router();
const scrape = require('./scrape');

let news_contents = [], top_news = [];

find_last_updated_value().then(()=>{});

router.get('/', async(ctx, next) => {
<<<<<<< HEAD
    await find_last_updated_value();
    await next();
=======
            find_last_updated_value().then(() => {
                await next();
            });
>>>>>>> f023ce603cf918aa66b3cee5e6059f90f3323160
});

router.get('/', async(ctx) => {
    ctx.render('index', {
        top_news,
        news_contents,
        page_title : "News"
    });
});

router.get('/:newsc', async(ctx) => {
    let from = ctx.params.newsc;
    if(from == 'hindu' || from == 'bbc' || from == 'nyctimes')
    {
        let requested_page_contents = top_news.filter(e => (e['from'] === from) ? 1 : 0);
        requested_page_contents = [...news_contents.filter(e => (e['from'] === from) ? 1 : 0)];
        ctx.render('particular', {
            requested_page_contents,
            page_title: from
        });
    } else {
        ctx.redirect('/error/404');
    }
});

router.get('/error/404', async(ctx) => {
    ctx.body = "Page not found";
});

function difference_of_time(l, c){let k = Math.floor(-((l%10000000)/60000) + ((c%10000000)/60000)); return k < 0 ? -k : k;}

async function set_news_contents_and_top_news_variable() {
    news_contents =[];
    top_news=[];
    db.find({news : true}, (e, topnews) => {
        topnews.map((news_obj) => {
            if(news_obj.top)
                top_news = [...top_news,news_obj];
            else
                news_contents = [...news_contents, news_obj];
        });
    });
}


async function find_last_updated_value() {
    return new Promise((resolve, reject) => {
        db.find({l_up_key : 1}, (err, val) => {
            if(err) reject(err);
            if(val.length > 1)
                db.remove({}, {multi : true}, () => update_news(undefined));
            else
		update_news(val[0]);
        });
	resolve(1);
    });
}

async function update_news(val) {
    if(val == undefined || difference_of_time(val.last_updated, Date.now()) > 30) {
        if(val == undefined)
            db.insert({l_up_key: 1, last_updated : Date.now()});
        else
            db.update({l_up_key : 1},  {last_updated: Date.now()}, {});
        db.remove({news:true}, {multi:true});
        await Promise.all([scrape.scrape_hindu(), scrape.scrape_bbc(), scrape.scrape_nytimes()]).then(() => {console.log("Scrapped");});
	await set_news_contents_and_top_news_variable();
    } else {
        await set_news_contents_and_top_news_variable();
    }
}

module.exports = router;
