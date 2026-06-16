"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { api } from "~/trpc/react";
import { Dialog, DialogHeader, DialogBody } from "~/app/_components/widgets/Dialog";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { frappe } from "~/theme/colors";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  type: "organization" | "project";
  targetId: string;
  organizationId: string;
}

export function AddMemberDialog({ open, onClose, type, targetId, organizationId }: AddMemberDialogProps) {
  const utils = api.useUtils();
  const [email, setEmail] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const debouncedEmail = useDebounce(email, 300);

  const { data: users, isLoading: isSearching } = api.user.search.useQuery(
    {
      email: debouncedEmail,
      ...(type === "organization"
        ? { excludeOrganizationId: organizationId }
        : { organizationId, excludeProjectId: targetId }),
    },
    { enabled: debouncedEmail.length >= 2 },
  );

  const addToOrg = api.organization.addMember.useMutation({
    onSuccess: (_, vars) => {
      setAddedIds((prev) => new Set(prev).add(vars.userId));
      void utils.organization.getById.invalidate({ id: organizationId });
    },
    onError: (err, vars) => setErrorMap((prev) => ({ ...prev, [vars.userId]: err.message })),
  });

  const addToProject = api.project.addMember.useMutation({
    onSuccess: (_, vars) => {
      setAddedIds((prev) => new Set(prev).add(vars.userId));
      void utils.project.getAll.invalidate({ organizationId });
    },
    onError: (err, vars) => setErrorMap((prev) => ({ ...prev, [vars.userId]: err.message })),
  });

  const handleAdd = (userId: string) => {
    setErrorMap((prev) => { const n = { ...prev }; delete n[userId]; return n; });
    if (type === "organization") {
      addToOrg.mutate({ organizationId, userId });
    } else {
      addToProject.mutate({ projectId: targetId, userId });
    }
  };

  const handleClose = () => {
    setEmail("");
    setAddedIds(new Set());
    setErrorMap({});
    onClose();
  };

  const isPendingFor = (userId: string) =>
    (type === "organization" ? addToOrg : addToProject).isPending &&
    (type === "organization" ? addToOrg : addToProject).variables?.userId === userId;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader
        title={`Add ${type === "organization" ? "Organization" : "Project"} Member`}
        onClose={handleClose}
      />

      <DialogBody>
        <Box sx={{ px: 1, py: 0.5 }}>
          <TextField
            label="Search by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            autoFocus
            size="small"
          />
        </Box>

        {debouncedEmail.length >= 2 && (
          <Box>
            {isSearching ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={20} sx={{ color: frappe.blue }} />
              </Box>
            ) : !users || users.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center", fontSize: "0.82rem", color: frappe.overlay0 }}>
                No users found matching "{debouncedEmail}"
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", border: `1px solid ${frappe.surface0}` }}>
                {users.map((user) => {
                  const added = addedIds.has(user.id);
                  const error = errorMap[user.id];
                  return (
                    <Box
                      key={user.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderBottom: `1px solid ${frappe.surface0}`,
                        "&:last-child": { borderBottom: "none" },
                        backgroundColor: added ? `${frappe.green}08` : "transparent",
                      }}
                    >
                      <Avatar
                        src={user.image ?? undefined}
                        alt={user.name ?? ""}
                        sx={{ width: 30, height: 30, fontSize: "0.75rem" }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ fontSize: "0.85rem", fontWeight: 600, color: frappe.text, lineHeight: 1.3 }}>
                          {user.name ?? "Unknown"}
                        </Box>
                        <Box sx={{ fontSize: "0.75rem", color: frappe.overlay1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </Box>
                        {error && (
                          <Box sx={{ fontSize: "0.72rem", color: frappe.red, mt: 0.25 }}>{error}</Box>
                        )}
                      </Box>
                      {added ? (
                        <Box sx={{ fontSize: "0.75rem", color: frappe.green, fontWeight: 600, flexShrink: 0 }}>
                          Added
                        </Box>
                      ) : (
                        <Button
                          intent="ghost"
                          size="small"
                          onClick={() => handleAdd(user.id)}
                          disabled={isPendingFor(user.id)}
                          sx={{ flexShrink: 0, minWidth: 60, fontSize: "0.78rem" }}
                        >
                          {isPendingFor(user.id) ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : "Add"}
                        </Button>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </DialogBody>
    </Dialog>
  );
}
