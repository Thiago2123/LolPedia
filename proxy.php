<?php

function fetchUrl($url, $funcao) {
    // Sua chave de API da Riot Games
    if(isset($_GET['count'])){
        $count = $_GET['count'];
    }

    $api_key = 'RGAPI-f8875666-64d3-427b-96ba-90001c8f6bb4';
    
    // Verifica se a função é "historico"
    if ($funcao == 'historico') {
        // Adiciona a API key usando "&api_key="
        $url .= '&count='. $count;
        $url .= '&api_key=' . $api_key;
        // echo $url;
    } else {
        // Adiciona a API key usando "?api_key="
        $url .= '?api_key=' . $api_key;
    }
    // Inicializar cURL
    $curl = curl_init();

    // Configurar a solicitação cURL
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    // Executar a solicitação cURL
    $response = curl_exec($curl);

    // Verificar se houve erros na solicitação
    if(curl_errno($curl)) {
        // Se houver um erro na solicitação, retornar um erro
        return json_encode(array('error' => 'Erro ao fazer solicitação para a URL: ' . curl_error($curl)));
    }

    // Fechar a sessão cURL
    curl_close($curl);

    // Retornar os dados da resposta
    return $response;
}

// Verificar se a URL é fornecida como um parâmetro GET
if(isset($_GET['url'])) {
    $url = $_GET['url'];
    if(isset($_GET['funcao'])){
        $funcao = $_GET['funcao'];
    }

    // Chamar a função fetchUrl com a URL fornecida e a função
    echo fetchUrl($url, $funcao);
} else {
    // Se a URL ou a função não foram fornecidas, retornar um erro
    echo json_encode(array('error' => 'URL ou função não fornecidas'));
}

?>
