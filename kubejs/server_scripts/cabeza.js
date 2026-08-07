EntityEvents.death(event => {
    const player = event.entity;

    // Validaciones
    if (!player.isPlayer()) return;
    if (player.level.isClientSide()) return; 

    // Captura de datos
    const x = Math.floor(player.x);
    const y = Math.floor(player.y);
    const z = Math.floor(player.z);
    const name = player.username;
    const level = player.level;
    const server = event.server;
    
    // 1. Limpiamos la dimensión para que quede estéticamente bien
    const rawDim = String(level.dimension);
    let dimName = "Desconocida";
    if (rawDim.includes("overworld")) dimName = "Overworld";
    else if (rawDim.includes("the_nether")) dimName = "Nether";
    else if (rawDim.includes("the_end")) dimName = "End";

    if (y < -60) return;

    server.scheduleInTicks(5, () => {
        try {
            // Generación de la base
            level.getBlock(x, y, z).set('minecraft:bedrock');
            level.getBlock(x, y + 1, z).set('minecraft:nether_brick_fence');
            
            // 2. LA MANERA ANTIGUA: Colocamos el bloque físicamente mediante la API...
            let headBlock = level.getBlock(x, y + 2, z);
            headBlock.set('minecraft:player_head');
            // ...y luego le inyectamos los datos del jugador (el equivalente a SkullOwner)
            headBlock.mergeEntityData({ profile: { name: name } });
            
            // 3. Mensaje JSON estructurado: Colores grises y dimensión limpia
            server.runCommandSilent(`tellraw @a ["",{"text":"La cabeza de ","color":"gray"},{"text":"${name}","color":"dark_gray"},{"text":" yace en X: ${x}, Y: ${y + 2}, Z: ${z} (","color":"gray"},{"text":"${dimName}","color":"dark_gray"},{"text":")","color":"gray"}]`);
            
        } catch (error) {
            console.error("Error crítico al generar la tumba: " + error);
        }
    });
});