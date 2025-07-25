import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CreateApiRequest } from "@/types/api";

const apiFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ API"),
  url: z.string().url("กรุณากรอก URL ที่ถูกต้อง"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  status: z.enum(["active", "inactive", "maintenance"]),
  version: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  headers: z.string().optional(),
});

type ApiFormData = z.infer<typeof apiFormSchema>;

interface ApiFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiFormModal({ open, onOpenChange }: ApiFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApiFormData>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      method: "GET",
      status: "active",
    },
  });

  const createApiMutation = useMutation({
    mutationFn: async (data: CreateApiRequest) => {
      const response = await apiRequest("POST", "/api/apis", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "เพิ่ม API สำเร็จ",
        description: "API ได้ถูกเพิ่มเข้าระบบแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApiFormData) => {
    let headers = {};
    if (data.headers) {
      try {
        headers = JSON.parse(data.headers);
      } catch (error) {
        toast({
          title: "รูปแบบ Headers ไม่ถูกต้อง",
          description: "กรุณาใช้รูปแบบ JSON ที่ถูกต้อง",
          variant: "destructive",
        });
        return;
      }
    }

    const apiData: CreateApiRequest = {
      name: data.name,
      url: data.url,
      method: data.method,
      status: data.status,
      version: data.version,
      description: data.description,
      category: data.category,
      headers,
    };

    createApiMutation.mutate(apiData);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            เพิ่ม API ใหม่
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อ API *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="เช่น User Authentication API"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              {...register("url")}
              placeholder="https://api.example.com/endpoint"
              className="mt-1"
            />
            {errors.url && (
              <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={watch("method")}
                onValueChange={(value) => setValue("method", value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  <SelectItem value="maintenance">ปรับปรุง</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">เวอร์ชัน</Label>
              <Input
                id="version"
                {...register("version")}
                placeholder="v1.0.0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Authentication, Product, Payment"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="อธิบายฟังก์ชันของ API"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              {...register("headers")}
              rows={3}
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              กรุณาใช้รูปแบบ JSON ที่ถูกต้อง
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createApiMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={createApiMutation.isPending}
            >
              {createApiMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
