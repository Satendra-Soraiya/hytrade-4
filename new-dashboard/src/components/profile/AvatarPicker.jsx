import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import resolveAvatarSrc, { resolveDefaultAvatarId } from '@/utils/avatar';

export default function AvatarPicker({
  profile,
  defaults,
  uploading,
  onPickDefault,
  onUpload,
}) {
  const previewSrc = resolveAvatarSrc(profile);
  const activeDefaultId = profile.profilePictureType === 'default'
    ? resolveDefaultAvatarId(profile.profilePicture)
    : null;

  return (
    <div className="space-y-5 text-foreground">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24 rounded-2xl border-2 border-border shadow-md">
          <AvatarImage key={previewSrc} src={previewSrc || undefined} alt="Profile" />
          <AvatarFallback className="rounded-2xl text-2xl font-semibold">
            {(profile.firstName || 'U')[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">Upload your own image or pick from our defaults below.</p>
          <Button variant="outline" size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload custom'}
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </label>
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Default avatars</p>
        {defaults.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading avatars…</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {defaults.map((item) => {
              const selected = activeDefaultId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPickDefault(item.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border-2 transition-all duration-200',
                    'hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50',
                  )}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="aspect-square h-full w-full object-cover"
                    loading="lazy"
                  />
                  {selected && (
                    <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-[10px] font-medium text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
