const requestApi = {
    baseApi:"https://br1.api.riotgames.com",
    baseApiAmerica:"https://americas.api.riotgames.com",
    baseApiDragon: "https://ddragon.leagueoflegends.com/cdn/",
    dominio: "https://lolpedia.wuaze.com/proxy.php",
};


$(document).ready(function() {
    let sidebar = document.querySelector(".sidebar");
    let bars = document.querySelector(".bars");
    
    bars.addEventListener("click", function() {
        sidebar.classList.contains("active") ? sidebar.classList.remove("active") :
        sidebar.classList.add("active");
    });

    $('#iconDarkMode').on("click", function() {  
        var icon = $(this);
        if (icon.hasClass('fa-sun')) {
            icon.removeClass('fa-sun').addClass('fa-moon');
            icon.css('color', '#bd009d');
            
        } else {
            icon.removeClass('fa-moon').addClass('fa-sun');
            icon.css('color', '#ffb100');

        }

        // Verifica se o corpo do documento possui a classe 'dark-mode'
        if ($('body').hasClass('dark-mode')) {
            // Se o corpo do documento já tiver a classe 'dark-mode', remove-a e restaura as variáveis CSS padrão
            $('body').removeClass('dark-mode');
            document.documentElement.style.setProperty('--fourth-color', '#FFF');
            document.documentElement.style.setProperty('--bg-color', '#ecedf0');
            document.documentElement.style.setProperty('--text-color', '#212529');


        } else {
            // Caso contrário, adiciona a classe 'dark-mode' e ajusta as variáveis CSS para o modo escuro
            $('body').addClass('dark-mode');
            document.documentElement.style.setProperty('--fourth-color', '#333');
            document.documentElement.style.setProperty('--bg-color', '#2b2b2bfc');
            document.documentElement.style.setProperty('--text-color', '#fff');
        }
    });

    
    const diretosreservados = document.querySelector("#diretosreservados");
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();

    diretosreservados.firstChild.nodeValue = '© '+ano+" ";
});    




function fazGet(url){
    // console.log(url);
    let request = new XMLHttpRequest();

    try {
        request.open("GET", url, false);
        // // Definindo cabeçalhos a partir da variável headerAPI
        // for (const [header, value] of headerAPI.entries()) {
        //     request.setRequestHeader(header, value);
        // }        
        
        request.send();


        var response = JSON.parse(request.response)
        // console.log('request',response.status);
        // console.log('request',response.status.status_code);

        if(request.status == 200){
            return response;
            
        }else{
            return response.status;
        }     
        
    } catch (error) {
        console.error("Erro na requisição: " + error);
        return error;
    }
   
    
}


//returna a ultima versao da api do lol
function verificaUltimaVersao(){
    return fetch('https://ddragon.leagueoflegends.com/api/versions.json')
        .then(response => response.json())
        .then(data => {
            versaoAPI = data[0];
            $('#versaoLol').text(versaoAPI);
            // console.log("versaoAPI ",data);
        });
}



function verificaUltimaVersaoV2(){
    versaoAPI = fazGet('https://ddragon.leagueoflegends.com/api/versions.json');
    return versaoAPI[0];
}


// função para retornar o tempo formatado sendo ele em segundos ou milissegundos, retornando tambem quanto tempo atras que foi o tempo
function formatarTempo(tempo) {
    let date;
    if (tempo.toString().length === 13) { // Verifica se o tempo é em milissegundos
        const timestamp = tempo;
        date = new Date(timestamp);
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        const formattedDate = date.toLocaleString('pt-BR', options);
        
        const diffMs = Date.now() - timestamp;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let diffString;
        if (diffDays === 1) {
            diffString = "1 dia";
        } else if (diffDays > 1) {
            diffString = `${diffDays} dias`;
        } else if(diffHours === 0){
            diffString = `${diffMinutes} minutos`;
        } else if(diffHours === 1){
            diffString = `${diffHours} hora ${diffMinutes} minutos`;
        }else {
            diffString = `${diffHours} horas ${diffMinutes} minutos`;
        }

        // console.log(`Dia: ${formattedDate}, Diferença: ${diffString}`);
        return { dia: formattedDate, diferenca: diffString };
    } else { // Se o tempo for em segundos
        const minutos = Math.floor(tempo / 60);
        const segundos = tempo % 60;
        // console.log(`Tempo em minutos: ${minutos}:${segundos}`);
        return { minutos, segundos };
    }
}