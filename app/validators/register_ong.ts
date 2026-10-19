import vine from '@vinejs/vine';

export const registerOngValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(80),
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(255),
    cnpj: vine.string().minLength(14).maxLength(18),
    telefone: vine.string().minLength(10).maxLength(25),
    cep: vine.string().minLength(8).maxLength(9),
    descricao: vine.string().maxLength(500),
    bairro: vine.string().maxLength(255),
    rua: vine.string().maxLength(255),
    numero: vine.string().maxLength(20),
    cidade: vine.string().maxLength(255),
    estado: vine.string().maxLength(2),
    complemento: vine.string().maxLength(255).optional(),
    quantidadeAnimais: vine.number().min(0),
    responsavelTecnico: vine.string().maxLength(255),
    images: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }).optional(),
  })
);
