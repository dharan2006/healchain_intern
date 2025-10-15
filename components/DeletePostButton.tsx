'use client'

import { Button } from "./ui/button";
import { toast } from "sonner";
import { deleteDailyPostAction } from "@/app/actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeletePostButtonProps {
    postId: string;
    postImageUrl: string | null;
    qrCodeImageUrl: string | null;
}

export function DeletePostButton({ postId, postImageUrl, qrCodeImageUrl }: DeletePostButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            setIsLoading(true);
            const result = await deleteDailyPostAction(postId, postImageUrl, qrCodeImageUrl);
            if (result.error) {
                toast.error("Delete Failed", { description: result.error });
            } else {
                toast.success("Post Deleted");
            }
            setIsLoading(false);
        }
    };
    
    return (
        <Button onClick={handleDelete} disabled={isLoading} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
    );
}