// $('.toggle').on('click', function() {
//     $('.menu').toggleClass('expanded');  
//     $('span').toggleClass('hidden');  
//     $('.container , .toggle').toggleClass('close');  
//   });

// let burger = document.querySelector('header__toggle');

// function click(clicItem, clasName, togName) {
//     let item = document.querySelector(clicItem);
//     let name = document.querySelector(clasName)
//     item.addEventListener('click', (e)=> name.classList.toggle(togName))
// }

// click('.header__toggle', '.header__menu', 'expanded')

let togName =  document.querySelector('.header__burger');

togName.addEventListener('click', function() {
    let menu = document.querySelector('.header__menu');
    let li = document.querySelectorAll('.header__item')
    menu.classList.toggle('expanded');
    togName.classList.toggle('active');
    li.forEach((i)=> i.classList.toggle('hidden'))
})

function ibg(){
    let ibg=document.querySelectorAll("._ibg");

    for (var i = 0; i < ibg.length; i++) {
        if(ibg[i].querySelector('img')){
            ibg[i].style.backgroundImage = 'url('+ibg[i].querySelector('img').getAttribute('src')+')';
        }
    }
}
    
ibg();

let slider = new Swiper('.company__swiper', {
    slidesPerView: 5,
    loop: true,
    loopedSlides: 5,
    autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: false,
        autoHeight: false
    }
});