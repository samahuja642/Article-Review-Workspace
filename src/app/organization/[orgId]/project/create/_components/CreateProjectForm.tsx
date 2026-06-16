"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "~/app/_components/widgets/Button";
import { TextField } from "~/app/_components/widgets/TextField";
import { createProjectSchema } from "~/server/api/validations/project";
import { api } from "~/trpc/react";
import { styles } from "./styles";
import type { z } from "zod";

type FormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectFormProps {
  orgId: string;
}

export function CreateProjectForm({ orgId }: CreateProjectFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", organizationId: orgId },
  });

  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate({ organizationId: orgId });
      router.push(`/organization/${orgId}`);
    },
    onError: (err) => setError("name", { message: err.message }),
  });

  const onSubmit = (values: FormValues) => {
    createProject.mutate(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.form}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Project Name"
            placeholder="e.g. Systematic Review 2025"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={createProject.isPending}
            autoFocus
          />
        )}
      />
      <Button
        intent="primary"
        type="submit"
        disabled={createProject.isPending}
        sx={styles.submitButton}
      >
        {createProject.isPending ? (
          <CircularProgress size={18} sx={{ color: "inherit" }} />
        ) : (
          "Create Project"
        )}
      </Button>
    </Box>
  );
}
