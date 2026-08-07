StartupEvents.registry('block', event => {
    // Usamos el tipo 'falling' para que tenga gravedad
    event.create('suspicious_soul_soil')
        .displayName('Suspicious Soul Soil')
        .soundType('soul_sand')
        // Línea de mapColor eliminada para evitar crasheos de registro
        .hardness(0.5)
        .resistance(0.5)
        // Ralentiza al jugador al caminar encima
        .speedFactor(0.4) 
        // Etiquetas nativas para que se comporte como Soul Sand real
        .tagBlock('minecraft:mineable/shovel')
        .tagBlock('minecraft:soul_speed_blocks') 
        .tagBlock('minecraft:soul_fire_base_blocks') 
        .tagBlock('minecraft:wither_summon_base_blocks'); 
})