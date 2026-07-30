"use client";

import { useActionState } from "react";
import { Mail, MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveSiteSettings,
  type SettingsActionState,
} from "./actions";

const initialState: SettingsActionState = {
  status: "idle",
  message: "",
};

export function SiteSettingsForm({
  whatsappNumber,
  whatsappMessageTemplate,
  supportEmail,
}: {
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  supportEmail: string;
}) {
  const [state, action, pending] = useActionState(
    saveSiteSettings,
    initialState,
  );

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-[#17251f] text-white">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle>WhatsApp sales channel</CardTitle>
              <CardDescription className="mt-1">
                Controls every storefront WhatsApp entry point.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp number</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={whatsappNumber}
              placeholder="9665XXXXXXXX"
              inputMode="tel"
              dir="ltr"
              aria-describedby="whatsapp-number-help"
              className="mt-2 h-11"
            />
            <p id="whatsapp-number-help" className="mt-2 text-xs leading-5 text-muted-foreground">
              Use international format without spaces. Leave blank to hide all WhatsApp buttons.
            </p>
            <FieldError errors={state.fieldErrors?.whatsappNumber} />
          </div>

          <div>
            <Label htmlFor="whatsappMessageTemplate">
              Default conversation message
            </Label>
            <Textarea
              id="whatsappMessageTemplate"
              name="whatsappMessageTemplate"
              defaultValue={whatsappMessageTemplate}
              rows={5}
              className="mt-2 resize-y"
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Used by the floating contact button. Product and checkout buttons append their own context.
            </p>
            <FieldError errors={state.fieldErrors?.whatsappMessageTemplate} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-[#8a621a]" aria-hidden="true" />
              <CardTitle>Support email</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Label htmlFor="supportEmail">Customer support address</Label>
            <Input
              id="supportEmail"
              name="supportEmail"
              type="email"
              defaultValue={supportEmail}
              placeholder="hello@nuraa.sa"
              dir="ltr"
              className="mt-2 h-11"
            />
            <FieldError errors={state.fieldErrors?.supportEmail} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {state.message ? (
              <p
                role={state.status === "error" ? "alert" : "status"}
                className={`mb-4 text-sm leading-6 ${
                  state.status === "error" ? "text-red-700" : "text-emerald-800"
                }`}
              >
                {state.message}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full bg-[#17251f] text-white hover:bg-[#17251f]/88"
            >
              <Save className="size-4" aria-hidden="true" />
              {pending ? "Saving settings…" : "Save settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? (
    <p className="mt-2 text-xs text-red-700">{errors[0]}</p>
  ) : null;
}
