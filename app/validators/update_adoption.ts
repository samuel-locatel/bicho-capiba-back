import vine from '@vinejs/vine';

export const updateAdoptionValidator = vine.compile(
  vine.object({
    status: vine.enum(['aprovado', 'rejeitado']),
    motivo: vine
      .string()
      .trim()
      .maxLength(1000)
      .optional()
      .requiredWhen('status', '=', 'rejeitado'),
  })
);
