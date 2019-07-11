const request = require('request');
const cheerio = require('cheerio');
const db = require('./database/_database');

//urls
const hindu = "https://www.thehindu.com/",
    nytimes = "https://www.nytimes.com/",
    bbc = "https://www.bbc.com/news";

//scraping functions
async function scrape_hindu(){
    //    object containing details
    let hindu_obj = [];
    return new Promise((resolve, rej) => {
        request(hindu, (err, res, html) => {
            if(err) rej(err);

            //    load page
            let $ = cheerio.load(html);
            let len = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div').length;
            for(let i = 1; i <= len-1; i++)
            {
                let dataset = {
                    from : "hindu",
                    news : true
                };
                //if no content
                if(i === 2)
                    continue;

                if(i === 1)
                {
                    dataset.top = true;
                    dataset.title = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') h1').text().trim();
                    dataset.link = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') a').attr('href');
                    dataset.description = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') p').text().trim();
                } else {
                    dataset.link = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') > div a').attr('href');
                    dataset.title = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') > div a.section-name').text().trim();
                    dataset.description = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') > div h2').text().trim();
                }

                dataset.time = $('body > div.container-main > section:nth-child(3) > div > div.main > div > div:nth-child('+i+') div.news-comments-area').text().trim();
                //hindu_obj.push(dataset);
                db.insert(dataset);
            }

            resolve(hindu_obj);
        });
    });
};


async function scrape_nytimes(){
    let nyc_obj = [];
    return new Promise((resolve, reject) => {
        request(nytimes, (err, res, html) => {
            if(err) reject(err);
            $ = cheerio.load(html);
            let len = $('#site-content > div.css-189d5rw.e6b6cmu0 > div.css-698um9 > div > div.css-k2t2rg > div > section > div').length;
            for(let i = 1; i <= len; i++)
            {
                let dataset = { from : "nyctimes", news : true};
                dataset.title = $('#site-content > div.css-189d5rw.e6b6cmu0 > div.css-698um9 > div > div.css-k2t2rg > div > section > div:nth-child('+i+') h2 > span:nth-child(1)').text();
                dataset.link = "https://www.nytimes.com"+$('#site-content > div.css-189d5rw.e6b6cmu0 > div.css-698um9 > div > div.css-k2t2rg > div > section > div:nth-child('+i+') a').attr('href');
                dataset.description = $('#site-content > div.css-189d5rw.e6b6cmu0 > div.css-698um9 > div > div.css-k2t2rg > div > section > div:nth-child('+i+') ul').text();
                dataset.time = $('#site-content > div.css-189d5rw.e6b6cmu0 > div.css-698um9 > div > div.css-k2t2rg > div > section > div:nth-child('+i+') div.css-1slnf6i').text();
                if(i === 1)
                    dataset.top = true;
                if(dataset.time.indexOf('comment') !== -1)
                    dataset.time = "";

                //nyc_obj.push(dataset);
                db.insert(dataset);
            }

            resolve(nyc_obj);
        });
    });
};


async function scrape_bbc(){
    return new Promise((resolve, reject) => {
        request(bbc, (err, res, body) => {
            if(err) reject(err);
            $ = cheerio.load(body);
            let len = $('#news-top-stories-container > div > div > div > div > div').length;
            let bbc_obj = [];
            for(let i = 1; i <= len-8; i++)
            {
                let dataset = { from : "bbc", news : true};
                let content = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+')').text().trim();
                if(content === "" || content === "Advertisement")
                    continue;
                if(i === 1)
                    dataset.top = true;
                dataset.title = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+') h3').text();
                dataset.link = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+') a').attr('href');
                if(dataset.link.indexOf('https') === -1){
                    let str = dataset.link;
                    str = str.split('');
                    str.unshift('https://www.bbc.com');
                    dataset.link = str.join('');
                }
                dataset.description = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+') p').text();
                dataset.time = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+') span.qa-status-date-output').html();
                dataset.location = $('#news-top-stories-container > div > div > div > div > div:nth-child('+i+') li a span').html();

                //bbc_obj.push(dataset);
                db.insert(dataset);
            }

            resolve(bbc_obj);
        });
    });
};

module.exports = {
    scrape_hindu,
    scrape_bbc,
    scrape_nytimes
}