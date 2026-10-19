import vine from '@vinejs/vine';

export const RegisterAnimalValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(1).maxLength(100),
    sexo: vine.enum(['M', 'F']),
    porte: vine.enum(['Pequeno', 'Medio', 'Grande']).optional(), // Opcional
    cor: vine.string().maxLength(50),
    especie: vine.string().maxLength(50),
    raca: vine.string().maxLength(50),
    data_nascimento: vine.string().maxLength(20).optional(), // Opcional
    vacinas: vine.array(vine.string()).optional(),
    castrado: vine.boolean().optional(),
    necessidades_especiais: vine.string().maxLength(200).optional(), // Opcional
    historia: vine.string().maxLength(2000).optional(), // Opcional
    sociavel_animal: vine.boolean().optional(), // Opcional
    sociavel_pessoa: vine.boolean().optional(), // Opcional
    images: vine.array(vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })).maxLength(10).optional(),
  })
);
