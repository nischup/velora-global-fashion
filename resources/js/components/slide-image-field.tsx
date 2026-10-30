import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    error?: string;
    existingUrl?: string | null;
    label?: string;
};

export default function SlideImageField({
    error,
    existingUrl = null,
    label = 'Image',
}: Props) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const preview = objectUrl ?? existingUrl;

    return (
        <div className="grid gap-2">
            <Label htmlFor="image">{label}</Label>
            <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    setObjectUrl((current) => {
                        if (current) {
                            URL.revokeObjectURL(current);
                        }

                        return file ? URL.createObjectURL(file) : null;
                    });
                    setLoaded(false);
                }}
            />
            <p className="text-muted-foreground text-xs">
                Wide photo works best. Preview appears after you pick a file.
            </p>
            <InputError message={error} />
            {preview ? (
                <div className="relative overflow-hidden rounded-lg border bg-[#f7f1e4]">
                    {!loaded && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-[#f7f1e4]/80">
                            <Spinner className="text-[#0d3b2e]" />
                            <span className="text-[11px] text-[#0d3b2e]/70">
                                Loading preview
                            </span>
                        </div>
                    )}
                    <img
                        src={preview}
                        alt=""
                        className="aspect-[16/7] w-full object-cover"
                        onLoad={() => setLoaded(true)}
                    />
                </div>
            ) : null}
        </div>
    );
}
