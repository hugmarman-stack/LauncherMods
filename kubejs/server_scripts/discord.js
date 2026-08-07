// kubejs/server_scripts/muertes_webhook.js

EntityEvents.death('minecraft:player', event => {
    // Sacamos el nombre del jugador y la razón de la muerte
    let jugador = event.entity.name.string;
    let razon = event.source.getLocalizedDeathMessage(event.entity).string;
    
    // AQUÍ PEGAS LA URL QUE COPIASTE EN EL PASO 1
    let webhookURL = "https://discord.com/api/webhooks/1534325450334273667/h4OLPoCSuv1ruSVRAE8H3yy6x7TZ91AIPsFhyHivaKlIPqqEW9i1OYMGBbZVa-EAI1QV"; 
    
    // Preparamos el mensaje secreto que leerá el bot. 
    // Usamos barras "|" para que luego a Python le sea fácil separar los datos.
    let contenido = "[SISTEMA_MUERTES] | " + jugador + " | " + razon;
    let jsonInputString = '{"content": "' + contenido + '"}';
    
    // Lo enviamos con 1 tick de retraso para no darle tirones al servidor
    Utils.server.scheduleInTicks(1, () => {
        try {
            let URL = Java.type('java.net.URL');
            let url = new URL(webhookURL);
            let conn = url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setDoOutput(true);
            
            let os = conn.getOutputStream();
            let input = new java.lang.String(jsonInputString).getBytes("utf-8");
            os.write(input, 0, input.length);
            os.flush();
            os.close();
            
            conn.getResponseCode(); // Esto dispara el mensaje a Discord
        } catch (err) {
            console.error("Error enviando muerte a Discord: " + err);
        }
    });
});