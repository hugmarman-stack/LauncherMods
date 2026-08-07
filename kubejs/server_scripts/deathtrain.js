const DoubleArgumentType = Java.loadClass('com.mojang.brigadier.arguments.DoubleArgumentType');

// 1. REGISTRO DEL COMANDO (/deathtrain)
ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event;

    event.register(
        Commands.literal('deathtrain')
            .requires(src => src.hasPermission(2)) 
            
            .then(Commands.literal('set')
                .then(Commands.argument('hours', DoubleArgumentType.doubleArg(0))
                    .executes(ctx => {
                        let hours = DoubleArgumentType.getDouble(ctx, 'hours');
                        let ticks = Math.floor(hours * 72000); 
                        ctx.source.server.persistentData.putInt('deathStormBaseTicks', ticks);
                        ctx.source.sendSuccess(Text.of(`§8[§c💀§8] §aSe ha configurado la tormenta por muerte a §e${hours} horas§a.`), true);
                        return 1;
                    })
                )
            )
            
            .then(Commands.literal('sumar')
                .then(Commands.argument('hours', DoubleArgumentType.doubleArg(0))
                    .executes(ctx => {
                        let hours = DoubleArgumentType.getDouble(ctx, 'hours');
                        let ticksToAdd = Math.floor(hours * 72000);
                        let currentTicks = ctx.source.server.persistentData.getInt('deathStormTicks') || 0;
                        
                        ctx.source.server.persistentData.putInt('deathStormTicks', currentTicks + ticksToAdd);
                        ctx.source.sendSuccess(Text.of(`§8[§c💀§8] §aSe han sumado §e${hours} horas §aa la tormenta actual.`), true);
                        return 1;
                    })
                )
            )
            
            .then(Commands.literal('restar')
                .then(Commands.argument('hours', DoubleArgumentType.doubleArg(0))
                    .executes(ctx => {
                        let hours = DoubleArgumentType.getDouble(ctx, 'hours');
                        let ticksToSub = Math.floor(hours * 72000);
                        let currentTicks = ctx.source.server.persistentData.getInt('deathStormTicks') || 0;
                        
                        let newTicks = Math.max(0, currentTicks - ticksToSub);
                        ctx.source.server.persistentData.putInt('deathStormTicks', newTicks);
                        ctx.source.sendSuccess(Text.of(`§8[§c💀§8] §aSe han restado §e${hours} horas §ade la tormenta actual.`), true);
                        return 1;
                    })
                )
            )
            
            .then(Commands.literal('apagar')
                .executes(ctx => {
                    ctx.source.server.persistentData.putInt('deathStormTicks', 0);
                    ctx.source.server.runCommandSilent('execute in minecraft:overworld run weather clear');
                    // Limpiamos la fuerza de los mobs por si acaso al apagar manualmente
                    ctx.source.server.runCommandSilent('execute in minecraft:overworld run effect clear @e[type=!player] minecraft:strength');
                    ctx.source.sendSuccess(Text.of(`§8[§c💀§8] §aLa tormenta ha sido apagada definitivamente.`), true);
                    return 1;
                })
            )
    );
});


// 2. EVENTO DE MUERTE DEL JUGADOR
EntityEvents.death('minecraft:player', event => {
    // Filtro crucial para singleplayer: Ignoramos el evento si proviene del cliente visual
    if (event.level.clientSide) return;
    
    let server = event.server;
    let playerName = event.entity.username || event.entity.name.string || "un jugador";
    
    let baseTicks = server.persistentData.getInt('deathStormBaseTicks');
    if (baseTicks <= 0) baseTicks = 72000; 
    
    let currentTicks = server.persistentData.getInt('deathStormTicks') || 0;
    let totalTicks = currentTicks + baseTicks;
    server.persistentData.putInt('deathStormTicks', totalTicks);
    
    let hoursAdded = (baseTicks / 72000).toFixed(2).replace('.00', '');
    let secondsToStorm = Math.floor(totalTicks / 20);

    server.scheduleInTicks(1, callback => {
        // Ejecución forzada e infalible vía comandos vanilla
        server.runCommandSilent(`execute in minecraft:overworld run weather thunder ${secondsToStorm}`);
        server.runCommandSilent(`tellraw @a {"text":"§8[§c⚡§8] §cPor la muerte de §4${playerName}§c, se instauran §e${hoursAdded} horas §cde tormenta."}`);
    });
});


// 3. ACTUALIZACIÓN DE TIEMPO, ACTIONBAR Y BUFOS A MOBS
ServerEvents.tick(event => {
    let server = event.server;
    
    // Todo este bloque se ejecuta 1 vez por segundo (cada 20 ticks)
    if (server.tickCount % 20 !== 0) return;

    let currentTicks = server.persistentData.getInt('deathStormTicks') || 0;

    if (currentTicks > 0) {
        currentTicks -= 20;
        server.persistentData.putInt('deathStormTicks', Math.max(0, currentTicks));

        if (currentTicks <= 0) {
            // El tiempo llegó a 0: Quitamos el clima y limpiamos los efectos
            server.runCommandSilent('execute in minecraft:overworld run weather clear');
            server.runCommandSilent('execute in minecraft:overworld run effect clear @e[type=!player] minecraft:strength');
            server.runCommandSilent('tellraw @a {"text":"§e☀ §aLa tormenta de la muerte ha terminado."}');
        } else {
            let totalSeconds = Math.floor(currentTicks / 20);
            let h = Math.floor(totalSeconds / 3600);
            let m = Math.floor((totalSeconds % 3600) / 60);
            let s = totalSeconds % 60;
            
            let timeString = `${h}h ${m}m ${s}s`;
            
            // 3.1. ActionBar con el diseño elegido
            server.players.forEach(player => {
                player.displayClientMessage(Text.of(`§e⚡ §7Tormenta activa: §c${timeString}`), true);
            });
            
            // 3.2. Instaponer la Tormenta: Comprueba y fuerza el clima cada 5 segundos (100 ticks)
            if (server.tickCount % 100 === 0) {
                server.runCommandSilent(`execute in minecraft:overworld run weather thunder ${totalSeconds}`);
            }

            // 3.3. Fuerza a los Mobs: Repartimos Fuerza 1 (amplificador 0) por 2 segundos a todo lo que no sea jugador
            // El 'true' al final oculta las partículas para que tu juego no se sature de efectos visuales.
            server.runCommandSilent('execute in minecraft:overworld run effect give @e[type=!player] minecraft:strength 2 0 true');
        }
    }
});