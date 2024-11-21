
// CASO TENHA HEADERS NA REQUISIÇÃO DA API 
    // const headerAPI = new Headers({
    //     "Access-Control-Allow-Origin": "*"
    
    // });

    

$(document).ready(function() {
    var campeoesFree = null;
    verificaUltimaVersao().then(() => {
        buscarCampeoes(versaoAPI);
        buscarFreeCampeoes(); 
        pesquisarCampeao();
       
    });

});    

// const requestApi = {
//     baseApi:"https://br1.api.riotgames.com",
//     baseApiAmerica:"https://americas.api.riotgames.com",
//     baseApiDragon: "https://ddragon.leagueoflegends.com/cdn/",
//     dominio: "http://lolpedia.wuaze.com/proxy.php",
// };


let box_img = document.getElementById('box-img');

function buscarCampeoes(versaoAPI){
    fetch('https://ddragon.leagueoflegends.com/cdn/'+versaoAPI+'/data/pt_BR/champion.json')
    .then(response => response.json()) // Transforma a resposta em JSON
    .then(data => {
        champions = data;

        for(const key in champions.data){
            let dadoImg = document.createElement('img');
            dadoImg.setAttribute("data-bs-toggle","modal");
            dadoImg.setAttribute('data-bs-target',"#modalChampion");
            dadoImg.setAttribute('id', key);
            dadoImg.setAttribute('idInterno', ""+champions.data[key].key+"");
            dadoImg.setAttribute('onclick', 'abrirModalChampion("'+key+'")');

            dadoImg.src = "https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/img/champion/"+key+".png";
            box_img.appendChild(dadoImg);
        }
        // console.log('champions', champions.data);
        
    }).catch(error => {
    console.error('Ocorreu um erro ao obter o JSON de campeoes:', error);
    });
}


function abrirModalChampion(champion){
    // alert(champion);
    let tituloModalChampion = document.getElementById('tituloModalChampion');
    let imgModalChampion = document.getElementById('imgModalChampion');
    let loreModalChampion = document.getElementById('loreModalChampion');
    let subTitleModalChampion = document.getElementById('subTitleModalChampion');


    $('#divSkills').empty();
    swiper.removeAllSlides();

    // Iniciar o slider no primeiro slide
    swiper.slideTo(0);
    // divSkinsModalChampion.innerHTML = '';
    let loreTab = document.getElementById('pills-lore-tab');
    loreTab.click();

    $("#nameSpell").html("");
    $("#textSpell").html("");
    $('#divModalTag').html("");

    fetch('https://ddragon.leagueoflegends.com/cdn/'+versaoAPI+'/data/pt_BR/champion/'+champion+'.json')
        .then(response => response.json())
        .then(data => {
            // console.log('data ', data)
            championDetails = data.data[champion];
            tituloModalChampion.innerHTML = championDetails.name;
            imgModalChampion.src = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+champion+"_0.jpg";
            loreModalChampion.innerHTML = championDetails.lore;
            subTitleModalChampion.innerHTML = championDetails.name + " " + championDetails.title;



            const coresTags = {
                'Tank': {
                    'cor': 'success',
                    'traducao': 'Tanque'
                },
                'Fighter': {
                    'cor': 'primary',
                    'traducao': 'Lutador'
                },
                'Marksman': {
                    'cor': 'warning',
                    'traducao': 'Atirador'
                },
                'Mage': {
                    'cor': 'purple',
                    'traducao': 'Mago'
                },
                'Assassin': {
                    'cor': 'danger',
                    'traducao': 'Assassino'
                },
                'Support': {
                    'cor': 'info',
                    'traducao': 'Suporte'
                }
            };

            championDetails.tags.forEach((tag, index) => {
                
                
                const tagInfo = coresTags[tag];
                const cor = tagInfo ? tagInfo.cor : 'primary'; // Se a tag não estiver no objeto coresTags, atribui a cor primária
                const traducao = tagInfo ? tagInfo.traducao : tag; // Se a tag não estiver no objeto coresTags, atribui uma string a tag sem tradução
                const tagHtml = $('<span class="badge rounded-pill text-bg-' + cor + '">' + traducao + '</span>');
            
                $('#divModalTag').append(tagHtml);

            });

            // INICIO ISKINS
            championDetails.skins.forEach((skin, index) => {
                const numSkin = skin.num;
                // console.log(skin);
                // Criar elemento div swiper-slide
                const divSwiperSlide = $('<div class="swiper-slide"></div>');
    
                // Criar elemento div testimonialBox
                const divTestimonialBox = $('<div class="testimonialBox"></div>');
                
                // resolvendo o bug das skins do fiddle que a key champion está errada na api ddragon
                if(numSkin > 8 && champion == "Fiddlesticks"){
                    champion = "FiddleSticks";
                }
                // Criar o elemento img
                const img = $('<img>', {
                    src: "https://ddragon.leagueoflegends.com/cdn/img/champion/loading/"+ champion+ "_" + numSkin + ".jpg",
                    alt: "skin_" + (index + 1)
                });

                const divContentSlide = $(`<div class="content"><div>${(skin.name === 'default') ? "" : skin.name}</div></div>`)
    
                // Adicionar a imagem à testimonialBox
                divTestimonialBox.append(img);

                divTestimonialBox.append(divContentSlide);
    
                // Adicionar a testimonialBox ao swiper-slide
                divSwiperSlide.append(divTestimonialBox);
    
                // Adicionar swiper-slide ao swiper-wrapper
                $('#swiper-wrapper').append(divSwiperSlide);
            });

             // Adicione um ouvinte de evento para o evento slideChange
            swiper.on('slideChange', function () {
                // Recupera o índice do slide ativo
                const activeSlideIndex = swiper.activeIndex;
                const numSkin = championDetails.skins[activeSlideIndex].num;

                const imgURL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champion + "_" + numSkin + ".jpg";

                // Atualiza a imagem na outra div
                imgModalChampion.src = imgURL;
            });

            // FIM ISKINS

            // INICIO HABILIDADES
            // Quando clica no divSpell dentro do divSkills adiciona a classe active
            $('#divSkills').on("click", ".divSpell", function(){
                const divSpell = $(this); // Captura a divSpell clicada
                // Encontra o elemento ativo e remove a classe active
                $('#divSkills').find('.divSpell.active').removeClass('active');
                // Adiciona a classe active ao elemento clicado
                divSpell.addClass('active');
            });
        

            const divSpell = $('<div id="divSpell" class="divSpell"></div');
            $('#divSkills').append(divSpell);

            const imgPassive = $('<img>', {
                src: "https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/img/passive/"+championDetails.passive.image.full,
                alt: "passive"
            });

            divSpell.append(imgPassive);

            divSpell.on("click", function(){
                const nameSpell = championDetails.passive.name;
                const textSpell = championDetails.passive.description;
                $("#nameSpell").html(nameSpell);
                $("#textSpell").html(textSpell);

            });
            


                championDetails.spells.forEach((spell, index) => {
                const divSpell = $('<div class="divSpell"></div');
                $('#divSkills').append(divSpell);

                const teclas = ['Q', 'W', 'E', 'R'];
                const teclaSpell = teclas[index];

                const spanSpell = $('<span>'+teclaSpell+'</span>');
                divSpell.append(spanSpell);

                const imgSpell = $('<img>', {
                    src: "https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/img/spell/"+spell.image.full,
                    alt: "Spell_"+teclaSpell
                });
                
                divSpell.append(imgSpell);


                divSpell.on("click", function(){
                    const nameSpell = spell.name;
                    const textSpell = spell.description;

                    $("#nameSpell").html(nameSpell);
                    $("#textSpell").html(textSpell);
                    // console.log('spell',textSpell);
                });
            });

            // FIM HABILIDADES

            // console.log("championDetails",championDetails);          


        }).catch(error => {
            console.error('Ocorreu um erro ao obter o JSON de campeoes:', error);
        });

}



function buscarFreeCampeoes(){
   
    var url = `${requestApi.dominio}?url=${requestApi.baseApi}/lol/platform/v3/champion-rotations`;

    $.ajax({
        url: url, // URL do seu script PHP
        type: 'GET',
        success: function(response) {
            var data = JSON.parse(response);
            // console.log("free", data);

             // const retornoApi = JSON.parse(data);
            // return data;
            let campeoesFree = data;

            $('#mostrarCampeaoFree').on("click", function(){
                iconFreeChampion = $(this).find('i');
                iconFreeChampion.toggleClass('far fa-square far fa-square-check');
                pesquisarCampeao();
                $('.box-img').find('img').each(function() { 
                    if (iconFreeChampion.hasClass('fa-square')) {
                        $(this).css('display', ''); // Resetar o estilo se estiver no array
                        $("#inputPesquisarCampeao").prop("disabled", false);
                    } else {
                        var idInterno = $(this).attr('idInterno');
                        // console.log(idInterno);
                        if (!campeoesFree.freeChampionIds[idInterno]) {
                            $("#inputPesquisarCampeao").prop("disabled", true);
                            $("#inputPesquisarCampeao").val("");
                            $(this).css('display', 'none');
                        }
                    }
                });
            });  
        },
        error: function() {
            // Se houver um erro na solicitação, exibir uma mensagem de erro
            $('#msg').html('Erro ao obter os dados.');
        }
    });

  
   

}


function pesquisarCampeao(){
    $("#inputPesquisarCampeao").on("keyup", function() {
        var nomeDigitado = $(this).val().toLowerCase(); // pegando o valor e transformando em minusculo
        $('.box-img img').each(function() {  // rodando o box-img para pegar todas imgs
            var idImagem = $(this).attr('id').toLowerCase(); // pegando o id da img que contem o nome do campeao
            if(idImagem.includes(nomeDigitado)) { // verificando se o id da img é contem o valor digitado
                $(this).show(); // mostrando o campeao
            } else {
                $(this).hide(); // desaparecendo os outros
            }
        });
    });
}

function pesquisarCampeaoPorFuncao(funcao){
    $('#mostrarCampeaoFree i').removeClass('fa-square-check');
    $('#mostrarCampeaoFree i').addClass('fa-square');
    $("#inputPesquisarCampeao").prop("disabled", false);
    $("#inputPesquisarCampeao").val("");
    
    $('.box-img img').hide();
    if (!funcao) {
        $('.box-img img').show();
        return;
    }
    const campeoesDetails = Object.values(champions.data);
    campeoesDetails.forEach(campeao => {
        if (campeao.tags.includes(funcao)) {
            $('#' + campeao.id).show();
        }
    });
}