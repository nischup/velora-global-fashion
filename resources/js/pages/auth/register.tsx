import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    AuthBrandLayout,
    authFieldClass,
    authLabelClass,
} from '@/layouts/auth/auth-brand-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <AuthBrandLayout
            title="Register"
            heading="Join the house"
            description="Create an account to shop considered pieces, save favourites, and follow your orders — clothing made to last."
        >
            <div className="rounded-3xl border border-velora-gold/30 bg-velora-ivory p-6 shadow-[0_24px_60px_rgba(13,59,46,0.08)] sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Membership
                </p>
                <h2 className="mt-2 text-2xl tracking-tight">
                    Create an account
                </h2>
                <p className="mt-1 text-sm text-velora-forest/65">
                    Enter your details below to join the house.
                </p>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="mt-8 flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className={authLabelClass}>
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    className={authFieldClass}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className={authFieldClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className={authLabelClass}
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                    className={authFieldClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className={authLabelClass}
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                    className={authFieldClass}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <p className="mt-6 text-center text-sm text-velora-forest/70">
                Already have an account?{' '}
                <Link
                    href={login()}
                    tabIndex={6}
                    className="font-medium text-velora-green underline decoration-velora-gold/50 underline-offset-4 hover:text-velora-gold"
                >
                    Log in
                </Link>
            </p>
        </AuthBrandLayout>
    );
}
