function getAvatarDom(a, e) {
    return `<img alt="user avatar" class="res_av morph_av" crossorigin="anonymous" draggable="false" src="${e}" loading="lazy">`
}

function getDefaultAvatarDom(a) {
    return '<img alt="user avatar" class="res_av morph_av" crossorigin="anonymous" draggable="false" src="/img/avatar/noavatar.webp" loading="lazy">'
}

function calculateAmt(a) {
    const e = a / 5;
    return e < 0 ? 0 : e > 1 ? 1 : e
}

function reviewElement(a) {
    return `\n <div id="reviews_" class="swiper-slide" data-hash="slide-${a.id}">\n <article role="article" tabindex="0" class="reviews_cont">\n <div class="wrap_all">\n <div class="wrap_top">\n <div class="wrap_avaus">\n ${a.avatar?getAvatarDom(a.id,a.avatar):getDefaultAvatarDom(a.id)}\n \n <cite class="review_user">${a.user}</cite>\n </div>\n <svg viewBox="0 0 23.67 21.92" class="lil_heart">\n <defs>\n <linearGradient id="progress_${a.id}" x1="0" y1="1" x2="0" y2="0">\n <stop id="stop1_${a.id}" offset="${calculateAmt(a.stars)}" stop-color="hsla(0, 0%, 100%, .25)"/>\n <stop id="stop2_${a.id}" offset="${calculateAmt(a.stars)}" stop-color="hsla(0, 0%, 100%, .13)"/>\n </linearGradient>\n </defs>\n <g>\n <path id="heartsvg" d="M11.84,21.92a2.58,2.58,0,0,0,1.09-.45c6.54-4.22,10.74-9.16,10.74-14.17C23.67,3,20.7,0,17,0a5.7,5.7,0,0,0-5.12,3.21A5.72,5.72,0,0,0,6.71,0C3,0,0,3,0,7.3c0,5,4.2,10,10.75,14.17A2.53,2.53,0,0,0,11.84,21.92Z" fill="url(#progress_${a.id})"></path>\n <text id="review_score" x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${a.stars}</text>\n </g>\n </svg>\n </div>\n <p class="text_review">${a.review}</p>\n </div>\n </article>\n </div>`
}

function loadMoreSlides(a, e) {
    for (const t of a) e(reviewElement(t))
}

function loadSlidesData(a = 5, e = 0, t, s, sortValue) {
    fetch(`../data_loader.php?limit=${a}&offset=${e}&sort=${sortValue}`, {
        method: "GET"
    }).then((a => a.json())).then((a => {
        loadMoreSlides(a, t), s()
    }))
}
