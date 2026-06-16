import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import authService, { type LoginData } from '../services/authService';
import useAuth from '../hooks/useAuth';
import { loginSchema } from '../auth/schema';
import type { LoginInput } from '../auth/schema';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await authService.login(data as unknown as LoginData);

      auth.login(response.user, response.token);

      alert('Accesso effettuato con successo!');
      onSuccess();
    } catch (error: any) {
      const axiosErr = error;

      if (axiosErr?.response?.status === 422) {
        const backendErrors = axiosErr.response.data.errors;

        if (backendErrors?.email) {
          setError('email', {
            type: 'backend',
            message: backendErrors.email[0] || backendErrors.email,
          });
        }

        if (backendErrors?.password) {
          setError('password', {
            type: 'backend',
            message: backendErrors.password[0] || backendErrors.password,
          });
        }
      } else if (axiosErr?.response?.status === 401) {
        setError('password', {
          type: 'backend',
          message: 'Email o password non validi',
        });
      } else {
        console.error('Errore generico:', error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-full mx-auto space-y-5 box-border"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight text-left">
          Bentornato
        </h2>

        <p className="text-sm text-neutral-500 text-left">
          Inserisci le tue credenziali per continuare.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="w-[85%] mx-auto space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Email
          </label>

          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-xl transition-all duration-200 outline-none box-border
              ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 ring-2 ring-red-100'
                  : 'border-neutral-200 focus:border-black ring-transparent focus:ring-black/5'
              }`}
          />

          {errors.email && (
            <p className="text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="w-[85%] mx-auto space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Password
          </label>

          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-xl transition-all duration-200 outline-none box-border
              ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 ring-2 ring-red-100'
                  : 'border-neutral-200 focus:border-black ring-transparent focus:ring-black/5'
              }`}
          />

          {errors.password && (
            <p className="text-xs text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-[85%] mx-auto block bg-neutral-900 text-white py-3 rounded-xl font-bold tracking-wide hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100 shadow-md shadow-neutral-300"
      >
        {isSubmitting ? 'Verifica in corso...' : 'Accedi'}
      </button>
    </form>
  );
}