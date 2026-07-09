import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { type ComponentType, useState } from "react";
import { toast } from "sonner";

export default function CopyButton({ value, buttonProps, iconProps }: {
    value: string,
    buttonProps?: ComponentType<typeof Button>,
    iconProps?: ComponentType<typeof Copy>
}
) {
    const [copied, setCopied] = useState(false)

    const handleCopyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Copied to clipboard')
        } catch (error) {
            console.log(error, 'error');
            
            toast.error('Failed to copy to clipboard')
        }

    }

    return <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(value)} {...buttonProps}>
        {
            copied ? <Check {...iconProps} className="w-4 h-4" />
                : <Copy {...iconProps} className="w-4 h-4" />
        }
    </Button>
}