import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import authService from '../services/authService';
import type { RegisterData } from '../services/authService';
import { registerSchema } from '../auth/schema';
import type { RegisterInput } from '../auth/schema';
import useAuth from '../hooks/useAuth';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await authService.register(data as unknown as RegisterData);
      auth.login(response.user, response.token);
      onSuccess();
    } catch (error: any) {
      if (error?.response?.status === 422) {
        const backendErrors = error.response.data.errors;
        if (backendErrors?.email) setError('email', { type: 'manual', message: backendErrors.email[0] });
        if (backendErrors?.password) setError('password', { type: 'manual', message: backendErrors.password[0] });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Crea account</h2>
        <p className="text-sm text-slate-500">Compila i campi per registrarti.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl transition-all outline-none ${
              errors.email
                ? 'border-red-300 focus:border-red-500 ring-2 ring-red-100'
                : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5'
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl transition-all outline-none ${
              errors.password
                ? 'border-red-300 focus:border-red-500 ring-2 ring-red-100'
                : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5'
            }`}
          />
          {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conferma password</label>
          <input
            type="password"
            {...register('password_confirmation')}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl transition-all outline-none ${
              errors.password_confirmation
                ? 'border-red-300 focus:border-red-500 ring-2 ring-red-100'
                : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5'
            }`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Registrazione...' : 'Registrati'}
      </button>
    </form>
  );
}