"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "~/app/_components/widgets/Button";
import { TextField } from "~/app/_components/widgets/TextField";
import { createOrganizationSchema } from "~/server/api/validations/organization";
import { api } from "~/trpc/react";
import { styles } from "./styles";
import type { z } from "zod";

type FormValues = z.infer<typeof createOrganizationSchema>;

export function CreateOrganizationForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  const createOrganization = api.organization.create.useMutation({
    onSuccess: () => router.push("/organization"),
    onError: (err) => setError("name", { message: err.message }),
  });

  const onSubmit = (values: FormValues) => {
    createOrganization.mutate(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.form}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Organization Name"
            placeholder="e.g. Acme Research Lab"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={createOrganization.isPending}
            autoFocus
          />
        )}
      />
      <Button
        intent="primary"
        type="submit"
        disabled={createOrganization.isPending}
        sx={styles.submitButton}
      >
        {createOrganization.isPending ? (
          <CircularProgress size={18} sx={{ color: "inherit" }} />
        ) : (
          "Create Organization"
        )}
      </Button>
    </Box>
  );
}
