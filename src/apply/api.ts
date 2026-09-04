export type ApplicationPayload = {
  name: string;
  phone: string;
  portfolio: string;
  resumes: File[];
  source?: "desktop" | "mobile";
};

export async function submitApplication(payload: ApplicationPayload): Promise<{ id: number }> {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("phone", payload.phone);
  form.append("portfolio", payload.portfolio);
  form.append("source", payload.source ?? "desktop");
  for (const file of payload.resumes) {
    form.append("resume", file);
  }

  const res = await fetch("/api/applications", {
    method: "POST",
    body: form,
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Не удалось отправить заявку");
  }

  return data as { id: number };
}
