import { Form, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AuthBrandLayout } from '@/layouts/auth/auth-brand-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthBrandLayout
            title="Email verification"
            heading="Confirm your email"
            description="Open the note we sent and you will step straight into your atelier — orders, saved pieces, and your details."
        >
            <div className="rounded-3xl border border-velora-gold/30 bg-velora-ivory p-6 shadow-[0_24px_60px_rgba(13,59,46,0.08)] sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Membership
                </p>
                <h2 className="mt-2 text-2xl tracking-tight">
                    Check your inbox
                </h2>
                <p className="mt-1 text-sm text-velora-forest/65">
                    Please verify your email address by clicking the link we
                    just emailed to you.
                </p>

                {status === 'verification-link-sent' && (
                    <p className="mt-4 text-sm font-medium text-velora-forest">
                        A new verification link has been sent to the email
                        address you provided during registration.
                    </p>
                )}

                <Form {...send.form()} className="mt-8 flex flex-col gap-4">
                    {({ processing }) => (
                        <>
                            <Button
                                disabled={processing}
                                className="h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                            >
                                {processing && <Spinner />}
                                Resend verification email
                            </Button>

                            <Link
                                href={logout()}
                                method="post"
                                as="button"
                                className="text-center text-sm text-velora-forest/70 underline decoration-velora-gold/50 underline-offset-4 hover:text-velora-gold"
                            >
                                Log out
                            </Link>
                        </>
                    )}
                </Form>
            </div>
        </AuthBrandLayout>
    );
}
