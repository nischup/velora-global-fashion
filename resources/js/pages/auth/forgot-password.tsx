import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
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
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthBrandLayout
            title="Forgot password"
            heading="Reset your password"
            description="Enter the email on your account and we will send a reset link — considered clothing, considered access."
        >
            <div className="rounded-3xl border border-velora-gold/30 bg-velora-ivory p-6 shadow-[0_24px_60px_rgba(13,59,46,0.08)] sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Membership
                </p>
                <h2 className="mt-2 text-2xl tracking-tight">
                    Forgot password
                </h2>
                <p className="mt-1 text-sm text-velora-forest/65">
                    Enter your email to receive a password reset link.
                </p>

                {status && (
                    <p className="mt-4 text-center text-sm font-medium text-velora-forest">
                        {status}
                    </p>
                )}

                <Form {...email.form()} className="mt-8 flex flex-col gap-5">
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
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                    className={authFieldClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                className="mt-2 h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <Spinner />}
                                Email password reset link
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <p className="mt-6 text-center text-sm text-velora-forest/70">
                Or, return to{' '}
                <Link
                    href={login()}
                    className="font-medium text-velora-green underline decoration-velora-gold/50 underline-offset-4 hover:text-velora-gold"
                >
                    log in
                </Link>
            </p>
        </AuthBrandLayout>
    );
}
