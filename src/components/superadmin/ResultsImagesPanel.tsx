"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';

interface ResultImage {
  id: string;
  image_url: string;
  created_at: string;
}

const ResultsImagesPanel: React.FC = () => {
  const [images, setImages] = useState<ResultImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ResultImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('results_images')
      .select('id, image_url, created_at') // Include created_at
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Natija rasmlarini yuklashda xato:", error);
      showError("Rasmlarni yuklashda xato yuz berdi.");
      setImages([]);
    } else {
      // Ensure data is correctly typed as ResultImage[]
      setImages(data as ResultImage[] || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImageFile(event.target.files[0]);
    } else {
      setNewImageFile(null);
    }
  };

  const handleUploadImage = async () => {
    if (!newImageFile) {
      showError("Iltimos, rasm faylini tanlang.");
      return;
    }

    setIsUploading(true);
    const toastId = showLoading("Rasm yuklanmoqda...");

    try {
      const fileExtension = newImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = `results_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('results_images')
        .upload(filePath, newImageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const publicImageUrl = supabase.storage.from('results_images').getPublicUrl(filePath).data.publicUrl;

      const { error: dbError } = await supabase
        .from('results_images')
        .insert([{ image_url: publicImageUrl }]);

      if (dbError) {
        throw dbError;
      }

      showSuccess("Rasm muvaffaqiyatli yuklandi!");
      setNewImageFile(null);
      const fileInput = document.getElementById('new-image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchImages(); // Refresh the list
    } catch (error: any) {
      console.error("Rasm yuklashda xato:", error);
      showError(`Rasm yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (image: ResultImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    const toastId = showLoading("Rasm o'chirilmoqda...");

    try {
      // Delete from storage
      const imageUrlParts = imageToDelete.image_url.split('/');
      const fileName = imageUrlParts[imageUrlParts.length - 1];
      const { error: deleteStorageError } = await supabase.storage
        .from('results_images')
        .remove([`results_images/${fileName}`]);

      if (deleteStorageError && deleteStorageError.message !== 'The resource was not found') {
        console.warn("Storage'dan rasmni o'chirishda xato:", deleteStorageError);
        // Don't throw, proceed with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: deleteDbError } = await supabase
        .from('results_images')
        .delete()
        .eq('id', imageToDelete.id);

      if (deleteDbError) {
        throw deleteDbError;
      }

      showSuccess("Rasm muvaffaqiyatli o'chirildi!");
      fetchImages(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (error: any) {
      console.error("Rasmni o'chirishda xato:", error);
      showError(`Rasmni o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Bizning Natijalarimiz Rasmlari</CardTitle>
          <CardDescription className="text-muted-foreground">Rasmlar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Bizning Natijalarimiz Rasmlari</CardTitle>
        <CardDescription className="text-muted-foreground">
          Bu yerda "Bizning natijalarimiz!" bo'limi uchun rasmlarni yuklashingiz va boshqarishingiz mumkin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-gray-800">
          <h3 className="text-xl font-semibold text-foreground mb-3">Yangi rasm yuklash</h3>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="new-image-upload" className="text-muted-foreground">Rasm faylini tanlang (JPG, PNG)</Label>
            <Input
              id="new-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              disabled={isUploading}
              className="file:text-ferrari-red file:bg-gray-700 file:border-ferrari-red file:hover:bg-gray-600"
            />
            {newImageFile && <p className="text-sm text-muted-foreground">Tanlangan fayl: {newImageFile.name}</p>}
            <Button
              onClick={handleUploadImage}
              disabled={isUploading || !newImageFile}
              className="mt-3 bg-ferrari-red hover:bg-red-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuklanmoqda...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Rasmni yuklash
                </>
              )}
            </Button>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-4">Mavjud rasmlar</h3>
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha yuklangan rasmlar mavjud emas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative overflow-hidden rounded-lg shadow-md group bg-card text-card-foreground">
                <img src={image.image_url} alt="Natija rasmi" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CustomDeleteButton onClick={() => handleDeleteClick(image)} disabled={isDeleting} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ferrari-red">Rasmni O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Siz bu rasmni butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              disabled={isDeleting}
              className="bg-destructive hover:bg-red-700 text-white"
            >
              {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ResultsImagesPanel;