import z from "zod";

const envSchema = z.object({
  STORAGE_DIR: z.string().min(1),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error(
    "Error: invalid environment variables:\n",
    z.prettifyError(result.error),
  );
  process.exit(1);
}

export const config = result.data;
