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
import { TURNSTILE_ACTION } from "@/lib/security/turnstile-constants";
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

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-destructive mt-1.5 text-sm" role="alert">
      {message}
    </p>
  ) : null;
}

function RequiredMark() {
  return (
    <>
      <span className="text-brand-dark" aria-hidden="true">
        {" "}
        *
      </span>
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}

async function requestFormToken() {
  const response = await fetch("/api/proposals/token", { cache: "no-store" });
  if (!response.ok) throw new Error("token");
  const result = (await response.json()) as { token: string };
  return result.token;
}

export function ProposalForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);

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

  const handleTurnstileToken = useCallback(
    (token: string) => form.setValue("turnstileToken", token),
    [form],
  );

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
      className="space-y-7 sm:space-y-8"
    >
      <p className="text-muted-foreground text-sm">
        Los campos marcados con <span aria-hidden="true">*</span> son
        obligatorios.
      </p>

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
            aria-errormessage={
              form.formState.errors.submitterName
                ? "submitterName-error"
                : undefined
            }
            {...form.register("submitterName")}
          />
          <FieldError
            id="submitterName-error"
            message={form.formState.errors.submitterName?.message}
          />
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
                <SelectTrigger
                  id="communityRole"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.communityRole)}
                  aria-errormessage={
                    form.formState.errors.communityRole
                      ? "communityRole-error"
                      : undefined
                  }
                >
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
          <FieldError
            id="communityRole-error"
            message={form.formState.errors.communityRole?.message}
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
            aria-invalid={Boolean(form.formState.errors.courseOrArea)}
            aria-errormessage={
              form.formState.errors.courseOrArea
                ? "courseOrArea-error"
                : undefined
            }
            {...form.register("courseOrArea")}
          />
          <FieldError
            id="courseOrArea-error"
            message={form.formState.errors.courseOrArea?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Categoría
          <RequiredMark />
        </Label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="category"
                className="w-full"
                aria-invalid={Boolean(form.formState.errors.category)}
                aria-required="true"
                aria-errormessage={
                  form.formState.errors.category ? "category-error" : undefined
                }
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
        <FieldError
          id="category-error"
          message={form.formState.errors.category?.message}
        />
      </div>

      {category === "otra" ? (
        <div className="animate-enter space-y-2">
          <Label htmlFor="customCategory">
            ¿Qué categoría describe mejor tu propuesta?
            <RequiredMark />
          </Label>
          <Input
            id="customCategory"
            maxLength={60}
            required
            aria-invalid={Boolean(form.formState.errors.customCategory)}
            aria-errormessage={
              form.formState.errors.customCategory
                ? "customCategory-error"
                : undefined
            }
            {...form.register("customCategory")}
          />
          <FieldError
            id="customCategory-error"
            message={form.formState.errors.customCategory?.message}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">
          Título de la propuesta
          <RequiredMark />
        </Label>
        <Input
          id="title"
          placeholder="Resume tu idea en una frase"
          maxLength={140}
          required
          aria-invalid={Boolean(form.formState.errors.title)}
          aria-errormessage={
            form.formState.errors.title ? "title-error" : undefined
          }
          {...form.register("title")}
        />
        <FieldError
          id="title-error"
          message={form.formState.errors.title?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción detallada
          <RequiredMark />
        </Label>
        <Textarea
          id="description"
          rows={7}
          maxLength={4000}
          required
          placeholder="Cuéntanos qué propones y qué situación ayudaría a mejorar."
          aria-invalid={Boolean(form.formState.errors.description)}
          aria-errormessage={
            form.formState.errors.description ? "description-error" : undefined
          }
          {...form.register("description")}
        />
        <FieldError
          id="description-error"
          message={form.formState.errors.description?.message}
        />
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
          aria-invalid={Boolean(form.formState.errors.expectedBenefit)}
          aria-errormessage={
            form.formState.errors.expectedBenefit
              ? "expectedBenefit-error"
              : undefined
          }
          {...form.register("expectedBenefit")}
        />
        <FieldError
          id="expectedBenefit-error"
          message={form.formState.errors.expectedBenefit?.message}
        />
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
          <div className="bg-ivory/60 rounded-lg border p-4">
            <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3">
              <Checkbox
                id="privacyAccepted"
                className="mt-1 size-5"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(form.formState.errors.privacyAccepted)}
                aria-required="true"
                aria-errormessage={
                  form.formState.errors.privacyAccepted
                    ? "privacyAccepted-error"
                    : undefined
                }
              />
              <Label
                htmlFor="privacyAccepted"
                className="block min-w-0 cursor-pointer text-base leading-7 font-normal sm:text-sm sm:leading-6"
              >
                He leído el{" "}
                <Link
                  href="/privacidad"
                  className="text-brand-dark font-semibold underline underline-offset-2"
                >
                  aviso de privacidad
                </Link>{" "}
                y acepto el uso responsable de este espacio.
                <RequiredMark />
              </Label>
            </div>
            <FieldError
              id="privacyAccepted-error"
              message={form.formState.errors.privacyAccepted?.message}
            />
          </div>
        )}
      />

      {turnstileSiteKey ? (
        <TurnstileWidget
          action={TURNSTILE_ACTION}
          siteKey={turnstileSiteKey}
          onToken={handleTurnstileToken}
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
        <p className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
          <ShieldCheck className="size-4" aria-hidden="true" /> Tus datos no
          serán públicos.
        </p>
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:min-w-48"
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
