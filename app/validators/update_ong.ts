import vine from '@vinejs/vine';

export const updateOngValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(3).maxLength(80).optional(),
    password: vine.string().minLength(6).maxLength(255).optional(),
    currentPassword: vine.string().optional().requiredIfExists('password'),
    telefone: vine.string().minLength(10).maxLength(25).optional(),
    cep: vine.string().minLength(8).maxLength(9).optional(),
    descricao: vine.string().maxLength(500).optional(),
    bairro: vine.string().maxLength(255).optional(),
    rua: vine.string().maxLength(255).optional(),
    numero: vine.string().maxLength(20).optional(),
    cidade: vine.string().maxLength(255).optional(),
    estado: vine.string().maxLength(2).optional(),
    complemento: vine.string().maxLength(255).optional().optional(),
    quantidadeAnimais: vine.number().min(0).max(100).optional(),
    responsavelTecnico: vine.string().maxLength(255).optional(),
    images: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }).optional(),
  })
);
