PlayerEvents.tick(event => {
    const player = event.player;
    const level = event.level;

    // Aislamiento de cliente para evitar fallos silenciosos en singleplayer
    if (level.clientSide) return; // [cite: 85, 86, 122]

    // Ejecutar el escáner solo cada 5 segundos (100 ticks) para evitar lag masivo
    if (player.tickCount % 20 !== 0) return; // 

    // Solo escanear si estamos en el Nether
    if (String(level.dimension) !== "minecraft:the_nether") return;

    // Definimos el radio. 24 bloques alrededor del jugador es el límite seguro.
    // Si subes este número a 50 o más, tu juego se va a congelar.
    const radio = 24; 
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);
    const pz = Math.floor(player.z);

    // Iteración en 3D para escanear el área
    for (let x = px - radio; x <= px + radio; x++) {
        for (let y = py - radio; y <= py + radio; y++) {
            for (let z = pz - radio; z <= pz + radio; z++) {
                
                let bloque = level.getBlock(x, y, z);
                
                // Si el radar detecta la piedra dorada, la fulmina y la reemplaza
                if (bloque.id === 'minecraft:gilded_blackstone') {
                    bloque.set('kubejs:suspicious_soul_soil');
                }
            }
        }
    }
});