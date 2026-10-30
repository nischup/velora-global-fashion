import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasskeyVerify from '@/components/passkey-verify';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    AuthBrandLayout,
    authFieldClass,
    authLabelClass,
} from '@/layouts/auth/auth-brand-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <AuthBrandLayout
            title="Log in"
            heading="Welcome back"
            description="Sign in to shop considered pieces, follow your orders, and pick up where you left off."
        >
            <div className="rounded-3xl border border-velora-gold/30 bg-velora-ivory p-6 shadow-[0_24px_60px_rgba(13,59,46,0.08)] sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Membership
                </p>
                <h2 className="mt-2 text-2xl tracking-tight">Log in</h2>
                <p className="mt-1 text-sm text-velora-forest/65">
                    Enter your email and password below.
                </p>

                {status && (
                    <p className="mt-4 text-center text-sm font-medium text-velora-forest">
                        {status}
                    </p>
                )}

                <div className="mt-8">
                    <PasskeyVerify
                        buttonClassName="w-full border-velora-gold/40 bg-velora-ivory text-velora-green hover:bg-velora-gold/10 hover:text-velora-green"
                        separatorClassName="bg-velora-ivory px-2 text-velora-forest/60"
                    />
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className={authLabelClass}
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className={authFieldClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className={authLabelClass}
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="ml-auto text-xs text-velora-forest/70 underline decoration-velora-gold/50 underline-offset-4 hover:text-velora-gold"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </Link>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className={authFieldClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-velora-gold/50 data-[state=checked]:border-velora-green data-[state=checked]:bg-velora-green"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-velora-forest/80"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <p className="mt-6 text-center text-sm text-velora-forest/70">
                Don't have an account?{' '}
                <Link
                    href={register()}
                    tabIndex={5}
                    className="font-medium text-velora-green underline decoration-velora-gold/50 underline-offset-4 hover:text-velora-gold"
                >
                    Sign up
                </Link>
            </p>
        </AuthBrandLayout>
    );
}
