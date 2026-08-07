PlayerEvents.tick(event => {
    const player = event.player;
    const level = event.level;

    // Aislamiento del cliente
    if (level.isClientSide()) return;

    // Ejecutamos cada segundo (20 ticks) para mantener el efecto infinito pero sin lag
    if (player.tickCount % 20 !== 0) return;

    const pos = player.blockPosition();
    
    try {
        // Leemos el bioma con el método que el radar confirmó que funciona
        let biomaActual = String(level.getBlock(pos).biomeId);

        // Si el texto incluye 'deep_dark', aplicamos el castigo
        if (biomaActual.includes('deep_dark')) {
            
            // Usamos comandos vanilla ejecutados por el servidor para dar Oscuridad y Ceguera por 3 segundos.
            // El 'true' al final oculta las partículas molestas de las pociones.
            event.server.runCommandSilent(`effect give "${player.username}" minecraft:darkness 3 0 true`);
            event.server.runCommandSilent(`effect give "${player.username}" minecraft:blindness 3 0 true`);
        }
    } catch (e) {
        // Mantenemos el escudo protector activo por si acaso
    }
});