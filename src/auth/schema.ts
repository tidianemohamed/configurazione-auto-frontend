import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().min(1, "L'email è obbligatoria").email("Inserisci un indirizzo email valido"),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
    password_confirmation: z.string().min(1, "Conferma la tua password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "La password e la conferma password devono corrispondere esattamente",
    path: ['password_confirmation'],
  });

export const loginSchema = z.object({
  email: z.string().min(1, "L'email è obbligatoria").email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
