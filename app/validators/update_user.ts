import vine from '@vinejs/vine';

export const updateUserValidator = vine.compile(
  vine.object({
    // Dados pessoais basicos
    fullName: vine.string().minLength(3).maxLength(255).optional(),
    email: vine.string().email().optional(),
    telefone: vine.string().trim().optional(),
    dataNascimento: vine.date().optional(),
    cpf: vine.string().trim().optional(),
    password: vine.string().minLength(6).maxLength(255).optional(),
    currentPassword: vine.string().optional().requiredIfExists('password'),

    // Dados de endereco
    cep: vine.string().minLength(8).maxLength(9).optional(),
    rua: vine.string().trim().optional(),
    numero: vine.string().trim().optional(),
    bairro: vine.string().trim().optional(),
    cidade: vine.string().trim().optional(),
    estado: vine.string().trim().optional(),
    complemento: vine.string().trim().optional(),
    latitude: vine.string().trim().optional(),
    longitude: vine.string().trim().optional(),
    numeroResidencia: vine.string().trim().optional(),
    complementoResidencia: vine.string().trim().optional(),

    // Dados da residencia
    tipoResidencia: vine.string().trim().optional(),
    areaExterna: vine.boolean().optional(),
    telaProtetora: vine.boolean().optional(),

    // Dados da composicao familiar
    composicaoFamiliar: vine.string().trim().optional(),
    quantidadeMoradores: vine.number().optional(),

    // Dados sobre criancas
    possuiCriancas: vine.boolean().optional(),
    quantidadeCriancas: vine.number().optional(),
    faixaEtariaCriancas: vine.string().trim().optional(),
    criancaNecessidadeEspecial: vine.boolean().optional(),
    tipoNecessidadeCriancas: vine.string().trim().optional(),

    // Dados sobre familiares com necessidades especiais
    familiarNecessidadeEspecial: vine.boolean().optional(),
    tipoNecessidadeEspecialFamiliar: vine.string().trim().optional(),

    // Dados sobre animais existentes
    possuiAnimais: vine.boolean().optional(),
    quantidadeAnimais: vine.number().optional(),
    idadeAnimais: vine.string().trim().optional(),
    sexoAnimais: vine.string().trim().optional(),

    // Experiencia e conhecimento
    experienciaComAnimais: vine.boolean().optional(),
    comportamentoAnimais: vine.string().trim().optional(),
    conhecimentoDespesasAnimais: vine.boolean().optional(),

    tempoDisponivel: vine.string().trim().optional(),
  })
);
