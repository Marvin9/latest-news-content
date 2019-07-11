const koa_router = require('koa-router');
const db = require('./database/_database');
const router = new koa_router();
const scrape = require('./scrape');

let news_contents = [], top_news = [];

db.findOne({l_up_key : 1}, (err, val) => {
    if(err) throw err;
    if(val === null || difference_of_time(val.last_updated, Date.now()) > 30) {
        if(val === null)
            db.insert({l_up_key : 1, last_updated: Date.now()});
        else
            db.update({l_up_key : 1}, {last_updated : Date.now()});
        db.remove({news : true}, {multi:true});
        Promise.all([scrape.scrape_hindu(), scrape.scrape_bbc(), scrape.scrape_nytimes()])
            .then(() => {
                console.log("Scraped");
                set_news_contents_and_top_news_variable();
            });
    } else {
        set_news_contents_and_top_news_variable();
    }

});

router.get('/', async(ctx) => {
    ctx.render('index', {
        top_news,
        news_contents,
        page_title : "Newss"
    });
});

router.get('/:newsc', async(ctx) => {
    let from = ctx.params.newsc;
    let requested_page_contents = top_news.filter(e => (e['from'] === from) ? 1 : 0);
    requested_page_contents = [...news_contents.filter(e => (e['from'] === from) ? 1 : 0)];
    ctx.render('particular', {
        requested_page_contents,
        page_title : from
    })
});

function difference_of_time(l, c){return Math.floor(-((l%10000000)/60000) + ((c%10000000)/60000));}

function set_news_contents_and_top_news_variable() {
    db.find({news : true}, (e, topnews) => {
        topnews.map((news_obj) => {
            if(news_obj.top)
                top_news = [...top_news,news_obj];
            else
                news_contents = [...news_contents, news_obj];
        });
    });
}

module.exports = router;