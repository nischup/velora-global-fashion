import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Preview = {
    key: string;
    name: string;
    url: string;
};

type Props = {
    id?: string;
    label?: string;
    files: File[];
    onChange: (files: File[]) => void;
    uploading?: boolean;
    error?: string;
    multiple?: boolean;
    max?: number;
};

export default function ImageUploadField({
    id = 'images',
    label = 'Images',
    files,
    onChange,
    uploading = false,
    error,
    multiple = true,
    max = 8,
}: Props) {
    const [previews, setPreviews] = useState<Preview[]>([]);
    const [loaded, setLoaded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const next = files.map((file, index) => ({
            key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setPreviews(next);
        setLoaded({});

        return () => {
            next.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [files]);

    const remaining = Math.max(0, max - files.length);

    return (
        <div className="grid gap-3">
            <div className="grid gap-2">
                <Label htmlFor={id}>{label}</Label>
                <Input
                    id={id}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    disabled={uploading || remaining === 0}
                    onChange={(event) => {
                        const selected = Array.from(event.target.files ?? []);
                        const next = multiple
                            ? [...files, ...selected].slice(0, max)
                            : selected.slice(0, 1);
                        onChange(next);
                        event.target.value = '';
                    }}
                />
                <p className="text-muted-foreground text-xs">
                    {files.length}/{max} selected · preview appears after you
                    pick a file
                </p>
                <InputError message={error} />
            </div>

            {previews.length > 0 && (
                <div className="relative">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {previews.map((preview, index) => (
                            <div
                                key={preview.key}
                                className="bg-muted relative overflow-hidden rounded-lg border"
                            >
                                {!loaded[preview.key] && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-[#f7f1e4]/80">
                                        <Spinner className="text-[#0d3b2e]" />
                                        <span className="text-[11px] text-[#0d3b2e]/70">
                                            Loading preview
                                        </span>
                                    </div>
                                )}
                                <img
                                    src={preview.url}
                                    alt={preview.name}
                                    className="aspect-square w-full object-cover"
                                    onLoad={() =>
                                        setLoaded((current) => ({
                                            ...current,
                                            [preview.key]: true,
                                        }))
                                    }
                                />
                                <div className="absolute top-1.5 right-1.5">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="size-7 rounded-full"
                                        disabled={uploading}
                                        onClick={() =>
                                            onChange(
                                                files.filter(
                                                    (_, fileIndex) =>
                                                        fileIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <X />
                                        <span className="sr-only">
                                            Remove {preview.name}
                                        </span>
                                    </Button>
                                </div>
                                <p className="truncate px-2 py-1.5 text-[11px]">
                                    {preview.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-lg bg-[#f7f1e4]/80">
                            <Spinner className="size-6 text-[#0d3b2e]" />
                            <p className="text-sm font-medium text-[#0d3b2e]">
                                Uploading images…
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
