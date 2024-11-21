// console.log('"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\CaminhoTeste"');

$('.nav-link').on('click', async function(){
    var idQueue;
    $('#loading').show();
    $("#historicoTodasPartidas, #historicoRankedSolo, #historicoRankedFlex").html("");
    try {
        const nomeInvocador = await procurarInvocador();
        console.log("nomeInvocador", nomeInvocador);
        var tabId = $(this).attr('id');
        switch (tabId) {
            case "tabIdhistoricoTodasPartidas-tab":
                break;
            case "historicoRankedSolo-tab":
                idQueue = 420;
                break;
            case "historicoRankedFlex-tab":
                idQueue = 440;
                break;
            default:
                break;
        }
        console.log("tabId " + tabId);

        // Chama a função para buscar os IDs das partidas após a guia ser clicada
        await buscarIdsPartidaDoHistorico(nomeInvocador.puuid, versaoAPI, idQueue, tabId);
    } catch (error) {
        console.error(error);
    }
});

function buscarIdsPartidaDoHistorico(puuid, versaoAPI, idQueue = null, tabId = null){
    console.log("idQueue2 " + idQueue);
    console.log("tabId " + tabId);
    $('#loading').show();

    if(!puuid){
        console.log("entrou no if");
        return false;
    }
    const tipoDaFila = "ranked";
    const countIdPartidas = "15";
    let url;

    if(idQueue){
        url = `${requestApi.dominio}?url=${requestApi.baseApiAmerica}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${idQueue}&start=0&count=${countIdPartidas}`;

    }else{
        url = `${requestApi.dominio}?url=${requestApi.baseApiAmerica}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${countIdPartidas}`;
    }


    $.ajax({
        url: url,
        type: 'GET',
        data: {
            funcao: 'historico'
        },
        success: function(response) {
            var partidasId = JSON.parse(response);
            buscarDadosDaPartida(partidasId, puuid, versaoAPI, tabId) ;
        },
        error: function() {
            $('#msg').html('Erro ao obter os dados.');
        }
    });
}


function buscarDadosDaPartida(partidasId, puuid, versaoAPI, tabId = null){
    
    if(tabId !== null){
        tabId = tabId.split("-")[0];
    }
    $(`#${tabId}`).html("");

    const idPartidas = partidasId;
    
    const filas = fazGet("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pt_br/v1/queues.json");
    const summonerSpells = fazGet("https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/data/pt_BR/summoner.json");
    const runasJson = fazGet("https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/data/pt_BR/runesReforged.json");
    const itensJson = fazGet("https://ddragon.leagueoflegends.com/cdn/"+versaoAPI+"/data/pt_BR/item.json");
    
    let posicoesJogadas;
    let top = 0;
    let jungle = 0;
    let mid = 0;
    let adc = 0;
    let support = 0;

    // Transforme o array filas em um objeto de fácil acesso
    const filasMap = {};
    filas.forEach(fila => {
        filasMap[fila.id] = fila; // Usando o `id` como chave
    });

    // console.log(runasJson);
    Promise.all([filas, summonerSpells, runasJson, itensJson])
        .then(([filas, summonerSpells, runasJson, itensJson]) => {
        idPartidas.forEach(idpartida => {
            const url = `${requestApi.dominio}?url=${requestApi.baseApiAmerica}/lol/match/v5/matches/${idpartida}`;

            $.ajax({
                url: url, // URL do seu script PHP
                type: 'GET',
                success: function(response) {
                    $('#loading').hide();
                    var responseData = JSON.parse(response);
                    var dadosPartida = responseData;
                    // console.log(dadosPartida);

                        
                    const tempoDaPartida = formatarTempo(dadosPartida.info.gameDuration);
                    const tempoDaPartidaCriada = formatarTempo(dadosPartida.info.gameEndTimestamp);

                    // Usa o id da partida como índice diretamente para obter os dados do mapa
                    const queueId = dadosPartida.info.queueId;
                    const mapa = filasMap[queueId]; // Busca usando o ID
                    console.log("filas 2", filas);
                    // Se o mapa for encontrado, use seu nome, senão  "Desconhecido"
                    const nomeDoMapa = mapa ? mapa.name : "Desconhecido";

                    const dadosDosTeams = dadosPartida.info.teams;
                    

                    let nomeDoParticipante;
                    let tagDoParticipante;
                    let nomeCampeaoJogado;
                    let kda;
                    let itens;
                    let campeaoLevel;
                    let sentinelasDeControle;
                    let vitoria;
                    let spels;
                    let runes;
                    let teamParticipante;
                    let jogadoresNaPartida = [];
                    let remake;
                    let placarDeVisao;


                    dadosPartida.info.participants.forEach(participante => {
                        if(puuid === participante.puuid){
                            nomeDoParticipante = participante.riotIdGameName;
                            tagDoParticipante = participante.riotIdTagline;
                            nomeCampeaoJogado = participante.championName;
                            kda = {kills : participante.kills, deaths : participante.deaths, assists : participante.assists};
                            itens = {item0 : participante.item0, item1 : participante.item1, item2 : participante.item2, item3 : participante.item3, item4 : participante.item4, item5 : participante.item5, item6 : participante.item6}
                            campeaoLevel = participante.champLevel;
                            sentinelasDeControle = participante.detectorWardsPlaced;
                            spels = {summnonerSpellD : participante.summoner1Id, summnonerSpellF : participante.summoner2Id};
                            runes = {primeiraPaginaRuna : participante.perks.styles[0], segundaPaginaRuna : participante.perks.styles[1]};
                            totalMinionsParticipante = participante.totalMinionsKilled + participante.neutralMinionsKilled;
                            placarDeVisao = participante.visionScore;

                            dadosDosTeams.forEach(team => {
                                if(participante.teamId === team.teamId){
                                    teamParticipante = team
                                }
                            });           
                            vitoria = participante.win;
                            remake = participante.gameEndedInEarlySurrender;
                            
                            console.log('participante', participante);
                            switch (participante.teamPosition) {
                                case "TOP":
                                    top++;
                                    break;
                                case "JUNGLE":
                                    jungle++;
                                    break;
                                case "MIDDLE":
                                    mid++;
                                    break;
                                case "UTILITY":
                                    support++;
                                    break;
                                case "BOTTOM":
                                    adc++;
                                    break;
                                default:
                                    break;
                            }
                            posicoesJogadas = {"top" : top, "jg" : jungle, "mid" : mid, "adc" : adc, "sup" : support};
                        }
                        
                        
                        jogadoresNaPartida.push({
                            nome: participante.summonerName,
                            nomeRiot : `${participante.riotIdGameName} #${participante.riotIdTagline}`,
                            campeao: participante.championName,
                            team: participante.teamId,
                            puuid : participante.puuid
                        });
                    });
                    // console.log("jogadoresNaPartida", jogadoresNaPartida);
                
                    
                    
                    // Separe os jogadores em dois arrays diferentes com base no time
                    const jogadoresTimeAzul = jogadoresNaPartida.filter(jogador => jogador.team === 100);
                    const jogadoresTimeVermelho = jogadoresNaPartida.filter(jogador => jogador.team === 200);

                    // Gere o HTML para os jogadores de cada time
                    let htmlJogadoresTimeAzul = "";
                    let htmlJogadoresTimeVermelho = "";

                    

                    jogadoresTimeAzul.forEach(jogador => {
                        htmlJogadoresTimeAzul += `
                        <div class="meuTooltip">
                            <div class="p-0 m-0" style="min-width:100px">
                                <div class="" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;"> 
                                    <img src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/champion/${jogador.campeao}.png" alt="campeaoJogado" style="width: 30px; padding: 0; margin: 0;">
                                    <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; ${puuid == jogador.puuid ? "font-weight: bold;" : "" }">${jogador.nome === "" ? jogador.nomeRiot : jogador.nome}</span>
                                </div>
                            </div>
                            <span class="tooltiptext" style="width: max-content;"">
                                <div>${jogador.nomeRiot}</div>
                            </span>
                        </div>`;
                    });

                    jogadoresTimeVermelho.forEach(jogador => {
                        htmlJogadoresTimeVermelho += `
                        <div class="meuTooltip">
                            <div class="p-0 m-0 " style="min-width:100px">
                            <div class="" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;"> 
                                    <img src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/champion/${jogador.campeao}.png" alt="campeaoJogado" style="width: 30px; padding: 0; margin: 0;">
                                    <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; ${puuid == jogador.puuid ? "font-weight: bold;" : "" }">${jogador.nome === "" ? jogador.nomeRiot : jogador.nome}</span>
                                </div>
                            </div>
                            <span class="tooltiptext" style="width: max-content;">
                                <div>${jogador.nomeRiot}</div>
                            </span>
                        </div>`;
                    });
                                



                    // console.log(teamParticipante);
                    
                    const runasDoJogador = {
                        paginaPrimaria: obterPaginaDeRuna(runes.primeiraPaginaRuna.style, runasJson),
                        paginaSecundaria: obterPaginaDeRuna(runes.segundaPaginaRuna.style, runasJson),
                        runasSelecionadas: {
                            paginaPrimaria: runes.primeiraPaginaRuna.selections.map(selecao => {
                                return {
                                    perk: obterRunaPorID(selecao.perk, runasJson),
                                    var1: selecao.var1,
                                    var2: selecao.var2,
                                    var3: selecao.var3
                                };
                            }),
                            paginaSecundaria: runes.segundaPaginaRuna.selections.map(selecao => {
                                return {
                                    perk: obterRunaPorID(selecao.perk, runasJson),
                                    var1: selecao.var1,
                                    var2: selecao.var2,
                                    var3: selecao.var3
                                };
                            })
                        }
                    };
                    
                    // console.log("Runas do jogador:", runasDoJogador);
                    
                    

                

                    const idDoFeiticoD = spels.summnonerSpellD;
                    const feitico_D = obterFeiticoPorID(idDoFeiticoD, summonerSpells);
                    const idDoFeiticoF = spels.summnonerSpellF;
                    const feitico_F = obterFeiticoPorID(idDoFeiticoF, summonerSpells);
                    // console.log(feitico_F);
                    
                    const kdaRatio = ((kda.kills + kda.assists) / kda.deaths).toFixed(2);
                    // console.log("kdaRatio",kdaRatio);
                    
                    
                    // dividir o totalDeTropas pelo mminutos total da partida (segundos foi transformado em minutos para somar com minutos), em seguida arredondar multiplicando por 10 e em seguida voltar para decimal dividindo por 10
                    const minionsPorMinuto = Math.round(totalMinionsParticipante / (tempoDaPartida.minutos +  (tempoDaPartida.segundos / 60)) * 10 ) / 10;
                    // console.log(minionsPorMinuto);

                    // calculo para verificar a participação em kills da partida
                    const participacaoEmKills = Math.round(((kda.kills + kda.assists) / teamParticipante.objectives.champion.kills) * 100);
                    // console.log(participacaoEmKills);

                    
                    const dadosItens = obterDadosItens(itens, itensJson);
                    // console.log("dadosItens", dadosItens);
                    
                    // console.log(vitoria);
                    const classeDerrota = vitoria ? '' : remake ? 'remake' : 'derrota';
                    var rowHtml = `
                        <div class="row rowPaiPartida ">
                                        <div class="col-1 firstDecoration ${classeDerrota}"></div>
                                        <div class="col-2 p-0 divPaiDadoPartida ${classeDerrota}">
                                            <div class="row ${classeDerrota}">
                                                <div class="col-12 textTipoPartida ${classeDerrota} ">${nomeDoMapa}</div>
                                                <div class="meuTooltip">
                                                    <div class="col-12 textDataPartida">Há ${tempoDaPartidaCriada.diferenca}</div>
                                                    <span class="tooltiptext" style="left: 20%;width: 100%;">${tempoDaPartidaCriada.dia}</span>
                                                </div>
                                                <hr class="col-4" style="margin: 1rem 0px">
                                                <div class="col-12 textStatusPartida">${vitoria ? 'Vitória' : remake ? 'Remake' : 'Derrota'}</div>
                                                <div class="col-12 textTempoPartida">${tempoDaPartida.minutos}:${tempoDaPartida.segundos}</div>
                                            </div>
                                        </div>
                                        <div class="col-3 divPaiCampeaoPartida ${classeDerrota}">
                                            <div class="row divCampeaoPartida ${classeDerrota}">
                                                <div class="col-4">
                                                    <div class="divImgCampeaoPartida">
                                                        <span class="textoLvlPartida">${campeaoLevel}</span>
                                                        <img class="imgCampeaoPartidaJogado" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/champion/${nomeCampeaoJogado}.png" alt="campeaoJogado">
                                                    </div>
                                                </div>
                                                <div class="col-5 divPaiSpellRunaPartida ${classeDerrota}">
                                                    <div class="row divSpellPartida ${classeDerrota}">
                                                        <div class="meuTooltip p-0 col-4">
                                                            <img class="imgSpellPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/spell/${feitico_D.image.full}" alt="Descrição da Imagem" title="Texto da dica ferramenta">
                                                            <span class="tooltiptext"><div style="color:rgb(255, 198, 89); font-weight: bold;">${feitico_D.name}</div><div>${feitico_D.description}</div></span>
                                                        </div>
                                                        <div class="meuTooltip p-0 col-4">
                                                            <img class="imgSpellPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/spell/${feitico_F.image.full}" alt="Descrição da Imagem" title="Texto da dica ferramenta">
                                                            <span class="tooltiptext"><div style="color:rgb(255, 198, 89); font-weight: bold;">${feitico_F.name}</div><div>${feitico_F.description}</div></span>
                                                        </div>
                                                    
                                                    </div>
                                                    <div class="row divRunaPartida ${classeDerrota}">
                                                        <div class="meuTooltip p-0 col-4">
                                                            <img class="imgRunaPartida" src="https://ddragon.leagueoflegends.com/cdn/img/${runasDoJogador.runasSelecionadas.paginaPrimaria[0].perk.icon}" alt="" style="transform: scale(1.4);">
                                                            <span class="tooltiptext"><div style="color:rgb(255, 198, 89); font-weight: bold;">${runasDoJogador.runasSelecionadas.paginaPrimaria[0].perk.name}</div><div>${runasDoJogador.runasSelecionadas.paginaPrimaria[0].perk.longDesc}</div></span>
                                                        </div>
                                                        <div class="meuTooltip p-0 col-4">
                                                            <img class="imgRunaPartida" src="https://ddragon.leagueoflegends.com/cdn/img/${runasDoJogador.paginaSecundaria.icon}" alt="">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-3">
                                                    <div class="row p-0 m-0 divPaiKdaPartida ${classeDerrota}">
                                                        <div class="col-12 p-0 textoKdaPartida">${kda.kills}/${kda.deaths}/${kda.assists}</div>
                                                        <div class="col-12 p-0 textoKdaPartida2">${kdaRatio} KDA</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-2 divPaiItensPartida ${classeDerrota}">
                                                <div class="meuTooltip">
                                                    ${itens.item0 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item0}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item0.name}</div>
                                                            <div>${dadosItens.item0.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item0.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item0.gold.total} (${dadosItens.item0.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item1 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item1}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item1.name}</div>
                                                            <div>${dadosItens.item1.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item1.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item1.gold.total} (${dadosItens.item1.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item2 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item2}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item2.name}</div>
                                                            <div>${dadosItens.item2.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item2.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item2.gold.total} (${dadosItens.item2.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item3 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item3}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item3.name}</div>
                                                            <div>${dadosItens.item3.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item3.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item3.gold.total} (${dadosItens.item3.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item4 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item4}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item4.name}</div>
                                                            <div>${dadosItens.item4.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item4.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item4.gold.total} (${dadosItens.item4.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item5 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item5}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item5.name}</div>
                                                            <div>${dadosItens.item5.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item5.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item5.gold.total} (${dadosItens.item5.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                                <div class="meuTooltip">
                                                    ${itens.item6 !== 0 ? `<img class="imgItensPartida" src="https://ddragon.leagueoflegends.com/cdn/${versaoAPI}/img/item/${itens.item6}.png" alt="item1"> 
                                                        <span class="tooltiptext">
                                                            <div style="color:rgb(0, 207, 188); font-weight: bold;">${dadosItens.item6.name}</div>
                                                            <div>${dadosItens.item6.plaintext}</div>
                                                            <br>
                                                            <div>${dadosItens.item6.description}</div>
                                                            <br>
                                                            <div style="display: inline-block;">Custo: </div>
                                                            <div style="color:rgb(255, 198, 89); font-weight: bold; display: inline-block;">${dadosItens.item6.gold.total} (${dadosItens.item6.gold.base})</div>    
                                                        </span>` 
                                                        : '<div class="imgPlaceholder"></div>'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-2 divPaiStatisticasPartida ${classeDerrota}">
                                            <div class="divStatisticasPartida">
                                                <div style="color:#E84057; font-weight: bold; font-size: 18px;" >P/Kill ${participacaoEmKills}%</div>
                                                <div>Sentilenas de controle: ${sentinelasDeControle}</div>
                                                <div>Placar de Visão: ${placarDeVisao}</div>
                                                <div class="meuTooltip">
                                                    <div>Tropas ${totalMinionsParticipante} (${minionsPorMinuto})</div>
                                                    <span class="tooltiptext">
                                                        <div>Tropa Neutra + Tropas (Total de Tropas / Tempo de Partida)</div>
                                                    </span>
                                                </div>
                                                <div></div>
                                            </div>
                                        </div>
                                        <div class="col-2 p-0 divPaiJogadoresPartida ${classeDerrota}" style="width: 7%;">
                                            <h7>Time Azul</h7>
                                            ${htmlJogadoresTimeAzul}
                                        </div>
                                        <div class="col-2 p-0 divPaiJogadoresPartida ${classeDerrota}" style="width: 7%;">
                                            <h7>Time Vermelho</h7>
                                            ${htmlJogadoresTimeVermelho}
                                        </div>
                                        <div class="col-1 lastDecoration ${classeDerrota}"></div>
                                    </div>
                        
                        `
                    // $("#historicoTodasPartidas").append(rowHtml);
                    $(`#${tabId}`).append(rowHtml);

                    console.log(dadosPartida);
                
                    $("#nomeInvocador").html(`<h3><strong>${nomeDoParticipante}</strong><span> #${tagDoParticipante} </span</h3>`);

                    $("#textBarraDeContagem").text(`Posições mais jogadas em ${idPartidas.length} partidas`);

                    $("#progressBarTop").css('height', `${(posicoesJogadas.top / idPartidas.length) * 100}%`).text(posicoesJogadas.top);
                    $("#progressBarJg").css('height', `${(posicoesJogadas.jg / idPartidas.length) * 100}%`).text(posicoesJogadas.jg);
                    $("#progressBarMid").css('height', `${(posicoesJogadas.mid / idPartidas.length) * 100}%`).text(posicoesJogadas.mid);
                    $("#progressBarAdc").css('height', `${(posicoesJogadas.adc / idPartidas.length) * 100}%`).text(posicoesJogadas.adc);
                    $("#progressBarSup").css('height', `${(posicoesJogadas.sup / idPartidas.length) * 100}%`).text(posicoesJogadas.sup);


                    // console.log(idPartidas);
                    // console.log("posicoesJogadas", posicoesJogadas);
                },
                error: function() {
                    $('#loading').hide();
                    // Se houver um erro na solicitação, exibir uma mensagem de erro
                    $('#msg').html('Erro ao obter os dados.');
                }
            
            });

            return posicoesJogadas;
        
        
        });
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
}




function obterFeiticoPorID(idDoFeitico, summonerSpells) {
    for (const key in summonerSpells.data) {
        if (summonerSpells.data.hasOwnProperty(key)) {
            const spell = summonerSpells.data[key];
            if (spell.key == idDoFeitico) {
                return spell;
            }
        }
    }
    return "Feitiço não encontrado";
}



function obterPaginaDeRuna(idPagina, runasJson) {
    const pagina = runasJson.find(pagina => pagina.id === idPagina);
    return pagina ? pagina : null;
}

function obterRunaPorID(idRuna, runasJson) {
    for (const pagina of runasJson) {
        for (const slot of pagina.slots) {
            for (const runa of slot.runes) {
                if (runa.id === idRuna) {
                    return runa;
                }
            }
        }
    }
    return null;
}


function obterDadosItens(jogadorItens, todosItens) {
    const dadosItensJogador = {};

    for (const [key, itemId] of Object.entries(jogadorItens)) {
        const itemData = todosItens.data[itemId];
        if (itemData) {
            dadosItensJogador[key] = itemData;
        } else {
            // console.error(`Item com ID ${itemId} não encontrado.`);
        }
    }

    return dadosItensJogador;
}


function calcularPorcentagem(height, maxValue) {
    return (height / maxValue) * 100;
}
