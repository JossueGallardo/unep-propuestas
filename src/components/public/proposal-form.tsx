"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { TurnstileWidget } from "@/components/public/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { communityRoles, proposalCategories } from "@/lib/constants";
import {
  proposalFormSchema,
  type ProposalFormInput,
} from "@/lib/validation/proposal";

type ApiError = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const defaultValues: ProposalFormInput = {
  isAnonymous: true,
  submitterName: "",
  communityRole: "",
  courseOrArea: "",
  category: "academico",
  customCategory: "",
  title: "",
  description: "",
  expectedBenefit: "",
  privacyAccepted: false,
  website: "",
  formToken: "",
  turnstileToken: "",
};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-destructive mt-1.5 text-sm">{message}</p>
  ) : null;
}

async function requestFormToken() {
  const response = await fetch("/api/proposals/token", { cache: "no-store" });
  if (!response.ok) throw new Error("token");
  const result = (await response.json()) as { token: string };
  return result.token;
}

export function ProposalForm() {
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const form = useForm<ProposalFormInput>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const isAnonymous = useWatch({ control: form.control, name: "isAnonymous" });
  const category = useWatch({ control: form.control, name: "category" });

  const refreshToken = useCallback(async () => {
    setTokenLoading(true);
    try {
      const token = await requestFormToken();
      form.setValue("formToken", token, { shouldValidate: false });
    } catch {
      setSubmitError(
        "No pudimos preparar el formulario. Recarga la página e inténtalo de nuevo.",
      );
    } finally {
      setTokenLoading(false);
    }
  }, [form]);

  useEffect(() => {
    let active = true;
    void requestFormToken()
      .then((token) => {
        if (active)
          form.setValue("formToken", token, { shouldValidate: false });
      })
      .catch(() => {
        if (active)
          setSubmitError(
            "No pudimos preparar el formulario. Recarga la página e inténtalo de nuevo.",
          );
      })
      .finally(() => {
        if (active) setTokenLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form]);

  async function onSubmit(values: ProposalFormInput) {
    setSubmitError("");
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        referenceCode?: string;
      } & ApiError;
      if (!response.ok || !result.referenceCode) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages[0];
            if (message) {
              form.setError(field as keyof ProposalFormInput, { message });
            }
          }
        }
        setSubmitError(
          result.message ??
            "No pudimos enviar la propuesta. Revisa los datos e inténtalo de nuevo.",
        );
        if (response.status === 400) await refreshToken();
        return;
      }
      setReferenceCode(result.referenceCode);
      form.reset(defaultValues);
    } catch {
      setSubmitError(
        "No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.",
      );
    }
  }

  async function startAnotherProposal() {
    setReferenceCode(null);
    setSubmitError("");
    form.reset(defaultValues);
    await refreshToken();
  }

  if (referenceCode) {
    return (
      <div
        className="animate-enter border-brand bg-white p-6 shadow-[8px_8px_0_#760606] sm:p-10"
        role="status"
        aria-live="polite"
      >
        <div className="bg-brand mb-5 flex size-12 items-center justify-center text-white">
          <Check aria-hidden="true" />
        </div>
        <p className="text-kicker">Propuesta recibida</p>
        <h3 className="mt-2 text-3xl">Gracias por compartir tu idea.</h3>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          UNEP la revisará de forma privada. Este espacio no ofrece respuestas
          individuales ni seguimiento público.
        </p>
        <div className="bg-ivory mt-6 border p-4">
          <p className="text-muted-foreground text-sm">Código de referencia</p>
          <p className="font-heading text-brand-dark mt-1 text-2xl tracking-wide">
            {referenceCode}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-7"
          onClick={startAnotherProposal}
        >
          <RotateCcw aria-hidden="true" /> Enviar otra propuesta
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <div className="flex items-start justify-between gap-5 border-b pb-6">
        <div>
          <Label htmlFor="anonymous" className="text-base font-bold">
            Enviar de forma anónima
          </Label>
          <p
            id="anonymous-description"
            className="text-muted-foreground mt-1 text-sm"
          >
            Si está activado, no guardaremos tu nombre.
          </p>
        </div>
        <Controller
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <Switch
              id="anonymous"
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (checked) form.setValue("submitterName", "");
              }}
              aria-describedby="anonymous-description"
            />
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="submitterName">
            Nombre{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
          </Label>
          <Input
            id="submitterName"
            autoComplete="name"
            disabled={isAnonymous}
            placeholder={isAnonymous ? "Oculto por envío anónimo" : "Tu nombre"}
            aria-invalid={Boolean(form.formState.errors.submitterName)}
            {...form.register("submitterName")}
          />
          <FieldError message={form.formState.errors.submitterName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="communityRole">
            Relación con la comunidad{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
          </Label>
          <Controller
            control={form.control}
            name="communityRole"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="communityRole" className="w-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {communityRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="courseOrArea">
            Curso o área{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
          </Label>
          <Input
            id="courseOrArea"
            placeholder="Ej.: Segundo de bachillerato, Biblioteca"
            {...form.register("courseOrArea")}
          />
          <FieldError message={form.formState.errors.courseOrArea?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="category"
                className="w-full"
                aria-invalid={Boolean(form.formState.errors.category)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {proposalCategories.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={form.formState.errors.category?.message} />
      </div>

      {category === "otra" ? (
        <div className="animate-enter space-y-2">
          <Label htmlFor="customCategory">
            ¿Qué categoría describe mejor tu propuesta?
          </Label>
          <Input
            id="customCategory"
            maxLength={60}
            {...form.register("customCategory")}
          />
          <FieldError message={form.formState.errors.customCategory?.message} />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Título de la propuesta</Label>
        <Input
          id="title"
          placeholder="Resume tu idea en una frase"
          maxLength={140}
          aria-invalid={Boolean(form.formState.errors.title)}
          {...form.register("title")}
        />
        <FieldError message={form.formState.errors.title?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción detallada</Label>
        <Textarea
          id="description"
          rows={7}
          maxLength={4000}
          placeholder="Cuéntanos qué propones y qué situación ayudaría a mejorar."
          aria-invalid={Boolean(form.formState.errors.description)}
          {...form.register("description")}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedBenefit">
          ¿Cómo crees que ayudaría esta propuesta?{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="expectedBenefit"
          rows={4}
          maxLength={1200}
          {...form.register("expectedBenefit")}
        />
        <FieldError message={form.formState.errors.expectedBenefit?.message} />
      </div>

      <div className="honeypot-field" aria-hidden="true">
        <Label htmlFor="website">Sitio web</Label>
        <Input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>

      <Controller
        control={form.control}
        name="privacyAccepted"
        render={({ field }) => (
          <div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacyAccepted"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(form.formState.errors.privacyAccepted)}
              />
              <Label
                htmlFor="privacyAccepted"
                className="text-sm leading-6 font-normal"
              >
                He leído el{" "}
                <Link
                  href="/privacidad"
                  className="text-brand-dark font-semibold underline underline-offset-2"
                >
                  aviso de privacidad
                </Link>{" "}
                y acepto el uso responsable de este espacio.
              </Label>
            </div>
            <FieldError
              message={form.formState.errors.privacyAccepted?.message}
            />
          </div>
        )}
      />

      {turnstileSiteKey ? (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={(token) => form.setValue("turnstileToken", token)}
        />
      ) : null}

      <input type="hidden" {...form.register("formToken")} />

      {submitError ? (
        <div
          role="alert"
          className="border-destructive bg-red-50 p-4 text-sm text-red-900"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4" aria-hidden="true" /> Tus datos no
          serán públicos.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting || tokenLoading}
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight aria-hidden="true" />
          )}
          {form.formState.isSubmitting
            ? "Enviando…"
            : tokenLoading
              ? "Preparando…"
              : "Enviar propuesta"}
        </Button>
      </div>
    </form>
  );
}
