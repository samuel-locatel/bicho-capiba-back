import vine from '@vinejs/vine'

export const UpdateAnimalValidator = vine.compile(
    vine.object({
        nome: vine.string().minLength(1).maxLength(100).optional(),
        idade: vine.number().min(0).optional(),
        sexo: vine.enum(['M', 'F']).optional(),
        porte: vine.enum(['Pequeno', 'Medio', 'Grande']).optional(), 
        cor: vine.string().maxLength(50).optional(),
        especie: vine.string().maxLength(50).optional(), 
        raca: vine.string().maxLength(50).optional(),
        data_nascimento: vine.string().maxLength(10).optional(), 
        vacinas: vine.string().maxLength(200).optional(), 
        castrado: vine.boolean().optional(),
        necessidades_especiais: vine.string().maxLength(200).optional(), 
        historia: vine.string().maxLength(500).optional(), 
        sociavel_animal: vine.boolean().optional(), 
        sociavel_pessoa: vine.boolean().optional(), 
        images: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }).optional() 
    })
)