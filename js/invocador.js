    // const requestApi = {
    //     baseApi:"https://br1.api.riotgames.com",
    //     baseApiAmerica:"https://americas.api.riotgames.com",
    //     baseApiDragon: "https://ddragon.leagueoflegends.com/cdn/",
    //     dominio: "http://lolpedia.wuaze.com/proxy.php",
    // };

    var puuid;
    var versaoAPI;


    function procurarInvocador() {
        return new Promise(function(resolve, reject) {
            const nomeInvocador = $('#input_nome').val();
            const tagInvocador = $('#input_tag').val();

            if (nomeInvocador === '' || tagInvocador === '') {
                var campoNome = $('#input_nome').attr('nomeCampo');
                var campoTag = $('#input_tag').attr('nomeCampo');
                mostrarMsg('msg', "O campo <b>" + (nomeInvocador === '' ? campoNome : campoTag) + "</b> está vazio", 4)
                reject(new Error('Campo inválido'));
            }

            var url = `${requestApi.dominio}?url=${requestApi.baseApiAmerica}/riot/account/v1/accounts/by-riot-id/${nomeInvocador}/${tagInvocador}`;
            // Fazer a solicitação AJAX usando jQuery
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    var responseData = JSON.parse(response);
                    if (responseData.status && responseData.status.status_code === 404) {
                        responseData.status.message = `Dados não encontrados para o invocador com o riot Id ${nomeInvocador} #${tagInvocador}`;
                        mostrarMsg('msg', responseData.status.message, 4)
                        reject(new Error('Dados não encontrados'));
                    } else {
                        resolve({ 'puuid': responseData.puuid, 'tag': responseData.tagLine });
                    }
                },
                error: function() {
                    // Se houver um erro na solicitação, rejeitar a promessa
                    $('#msg').html('Erro ao obter os dados.');
                    reject(new Error('Erro na solicitação AJAX'));
                }
            });
        });
    }


   async function buscarDadosInvocador() {
        try {
            versaoAPI = await verificaUltimaVersaoV2();
            const nomeInvocador = await procurarInvocador();

            if (nomeInvocador) {
                var url = `${requestApi.dominio}?url=${requestApi.baseApi}/lol/summoner/v4/summoners/by-puuid/${nomeInvocador.puuid}`;

                return new Promise(function(resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        success: function(response) {
                            var responseData = JSON.parse(response);
                            
                            // console.log("responseData.puuid", responseData.puuid);
                            buscarIdsPartidaDoHistorico(responseData.puuid, versaoAPI, null, "historicoTodasPartidas");
                            // const posicoesJogadas = buscarDadosDaPartida(idPartidas, data.puuid);

                            // console.log('idPartidas', idPartidas);
                            // console.log('posicoesJogadas', posicoesJogadas);
                            // console.log('buscarDadosInvocador', data);
                            console.log('nomeInvocador', nomeInvocador);

                            $("#imgInvocador").attr('src', 'https://ddragon.leagueoflegends.com/cdn/'+versaoAPI+'/img/profileicon/'+responseData.profileIconId+'.png');
                            $("#spanInvocadorLvl").html(responseData.summonerLevel);
                            // $("#nomeInvocador").html(`<h3><strong>${responseData.name}</strong><span> #${nomeInvocador.tag} </span</h3>`);
                            
                            
                            $("#rowInvocador").removeClass('d-none');
                            
                            resolve(responseData); // Resolve a promessa com os dados do invocador
                        },
                        error: function(error) {
                            reject(error); // Rejeita a promessa em caso de erro
                        }
                    });
                });
            } else {
                return null; // Retorna null se o nome do invocador não for encontrado
            }
        } catch (error) {
            console.error(error);
            throw error; // Lança o erro para ser tratado pelo código que chama esta função
        }
    }

    





    async function buscarDadosRanked() {
    try {
        const invocador = await buscarDadosInvocador(); // Espera pela resolução da promessa
        // console.log(invocador);
        if (invocador) {
            const idSummoner = invocador.id; // Extrai o idSummoner

            // console.log(idSummoner); // Agora você pode usar o idSummoner
            // Se o idSummoner existir, continue com a lógica
            $("#textRankedSolo, #textRankedFlex, #textRankedFlexPdl, #textRankedSoloPdl, #textRankedFlexWinrate, #textRankedSoloWinrate, #textRankedFlexWinLose, #textRankedSoloWinLose").html("");
            $("#imgRankedFlex, #imgRankedSolo").attr("src", "");

            var url = `${requestApi.dominio}?url=${requestApi.baseApi}/lol/league/v4/entries/by-summoner/${idSummoner}`;

            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    // Restante do seu código
                    var responseData = JSON.parse(response);
                    // console.log('responseData', responseData);

                    if (responseData.length == 0) {
                        $("#textRankedSolo, #textRankedFlex").html("Unranked").addClass('unranked');
                        $("#imgRankedSolo").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=Unranked.png`);
                        $("#imgRankedFlex").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=Unranked.png`);

                    } else {
                        $("#textRankedSolo, #textRankedFlex").removeClass('unranked');
                        let soloRanked = false;
                        let flexRanked = false;

                        responseData.forEach(function(rank) {
                            // console.log('rank', rank);
                            
                            if (rank.queueType === "RANKED_SOLO_5x5") {
                                let textoFormatado = rank.tier.charAt(0).toUpperCase() + rank.tier.slice(1).toLowerCase();
                                $("#imgRankedSolo").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=${textoFormatado}2.png`);
                                rank.tier = traduzirTier(rank.tier);
                                $("#textRankedSolo").html(rank.tier + " "+ rank.rank);
                                $("#textRankedSoloPdl").html(rank.leaguePoints + " LP");
                                $("#textRankedSoloWinLose").html(rank.wins + " V " + rank.losses + " L");

                                
                                $("#textRankedSoloWinrate").html("Winrate "+calcularWinRate(rank.wins, rank.losses)+"%");
                                soloRanked = true;
                            }
                            if (rank.queueType === "RANKED_FLEX_SR") {
                                let textoFormatado = rank.tier.charAt(0).toUpperCase() + rank.tier.slice(1).toLowerCase();
                                $("#imgRankedFlex").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=${textoFormatado}2.png`);
                                rank.tier = traduzirTier(rank.tier);
                                $("#textRankedFlex").html(rank.tier + " "+ rank.rank);
                                $("#textRankedFlexPdl").html(rank.leaguePoints + " LP");
                                $("#textRankedFlexWinLose").html(rank.wins + " V " + rank.losses + " L");

                                $("#textRankedFlexWinrate").html("Winrate "+calcularWinRate(rank.wins, rank.losses)+"%");
                                flexRanked = true;
                            }
                        });

                        if (!soloRanked) {
                            $("#textRankedSolo").html("Unranked").addClass('unranked');
                            $("#imgRankedSolo").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=Unranked.png`);

                        }
                        if (!flexRanked) {
                            $("#textRankedFlex").html("Unranked").addClass('unranked');
                            $("#imgRankedFlex").attr('src', `http://lolpedia.wuaze.com/imgs/emblemas/Rank=Unranked.png`);

                        }
                    }

                },
                error: function() {
                    // Tratamento de erro
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}





    function traduzirTier(tier) {
        switch (tier) {
            case "IRON":
                return "Ferro";
            case "BRONZE":
                return "Bronze";
            case "SILVER":
                return "Prata";
            case "GOLD":
                return "Ouro";
            case "PLATINUM":
                return "Platina";
            case "EMERALD":
                return "Esmeralda";
            case "DIAMOND":
                return "Diamante";
            case "MASTER":
                return "Mestre";
            case "GRANDMASTER":
                return "Grão Mestre";
            case "CHALLENGER":
                return "Desafiante";
            default:
                return tier;
        }
    }




    function calcularWinRate(vitorias, derrotas){
        const totalJogos = vitorias + derrotas;
        const winrate = (vitorias / totalJogos) * 100;
        const winrateArredondado = Math.round(winrate); // pegar apenas os dois numeros antes da virgula 
        // console.log('winrate', winrateArredondado); 
        return winrateArredondado;
    }









    



    function mostrarMsg(idCampo, msg, tempoSec = 3, cor = 'danger'){
        if (typeof msg !== 'string') {
            throw new Error('O parâmetro msg deve ser uma string.');
        }

        let alert = ` <div class="mt-2 alert alert-${cor}" role="alert">${msg}</div>`

        
        $('#'+idCampo).append(alert);
        setTimeout(() => {
            $('#'+idCampo).html("");
        }, tempoSec * 1000);
    }


    function verificaUltimaVersaoV2(){
        var url = `https://ddragon.leagueoflegends.com/api/versions.json`;
        // Fazer a solicitação AJAX usando jQuery
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
               
                versaoAPI = response[0] ;

                return versaoAPI;
            },
            error: function() {
                // Se houver um erro na solicitação, exibir uma mensagem de erro
                $('#msg').html('Erro ao obter os dados.');
            }
        });
    }