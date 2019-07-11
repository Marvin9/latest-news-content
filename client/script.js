
$(document).ready(() => {
    $('body').css('opacity', 1);
    for(let i = 1; i <= 3; i++)
        $(`a:nth-child(${i})`).animate({'opacity': 1}, (i*1000)-500);
    /*
    $('a h3').map(e => {
        let element = $('a:nth-child('+e+') h3');
        let title = element.text().split(' ');
        if(title.length > 18)
            element.html(title.splice(18).join(' ') + "...");
    });
     */
});