import { useForm } from "@tanstack/react-form";
import DefaultDontofficeLogo from "../../components/shared/DefaultDontofficeLogo";
import DragAndDropFileUploadInput from "../../components/shared/DragAndDropFileUploadInput";
import SlugInput from "../../components/shared/SlugInput";
import { ChevronRight, LoaderCircle } from "lucide-react";
import createRoute from "../../usecases/ppt/create-route";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";

type CreatePageData = {
  slug: string;
  file: File;
};

export function PPTCreatePage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async (data: CreatePageData) => {
      const response = await createRoute(data.slug, data.file);
      return response;
    },
    onSuccess: async ({ data }) => {
      const slug: string = data.slug;

      await navigate({
        to: "/ppt/$slug",
        params: {
          slug: slug,
        },
      });
    },
    onError: async (error: AxiosError, data) => {
      if (error.status === 400) {
        await navigate({
          to: "/ppt/$slug",
          params: {
            slug: data.slug,
          },
        });
      }
    },
  });

  const createForm = useForm({
    onSubmit: ({ value }) => {
      const data = value as CreatePageData;

      mutation.mutate(data);
    },
    canSubmitWhenInvalid: false,
  });

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <DefaultDontofficeLogo
          name=".ppt"
          initialGradientColor="#C43E1C"
          finalGradientColor="#FF8C69"
          className="text-[32px] ds-display"
        />
        <span className="ds-subtitle">
          Sua próxima apresentação, simples assim.
        </span>
        <div className="flex flex-col justify-center w-full gap-1">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();

              createForm.handleSubmit();
            }}
            className="flex flex-col justify-center w-full gap-2"
          >
            <createForm.Field
              name="file"
              validators={{
                onChange: ({ value }) => {
                  const file = value as File | undefined;

                  if (!file) {
                    return "Por favor, selecione um arquivo";
                  }

                  const extension = file.name.split(".").at(-1);
                  const allowedExtensions = [".ppt", ".pps", ".pptx", ".ppsx"];

                  if (
                    !extension ||
                    !allowedExtensions.includes("." + extension)
                  ) {
                    return "O tipo de arquivo fornecido é inválido";
                  }
                },
              }}
              children={(field) => {
                return (
                  <DragAndDropFileUploadInput
                    name={field.name}
                    id={field.name}
                    onDrop={(event) => {
                      event.preventDefault();

                      const files = event.dataTransfer.files;
                      if (files) {
                        const file = files.length > 0 ? files[0] : null;

                        field.handleChange(file);
                      }
                      field.validate("change");
                    }}
                    onChange={(event) => {
                      const file: File | undefined =
                        event.currentTarget.files?.[0] || undefined;

                      field.handleChange(file);
                    }}
                  />
                );
              }}
            />
            <createForm.Field
              name="slug"
              validators={{
                onChange: ({ value }) => {
                  const slug = value as string;

                  if (!slug) {
                    return "A rota tem que ser obrigatória";
                  }
                },
              }}
              defaultValue={""}
              children={(field) => (
                <SlugInput
                  name={field.name}
                  id={field.name}
                  placeholder="apresentacao-rapida"
                  onChange={(event) => {
                    const slug = event.currentTarget.value;
                    field.handleChange(slug);
                  }}
                  trailing={
                    <createForm.Subscribe
                      selector={(state) => [state.canSubmit, state.values]}
                      children={([canSubmit, values]) => {
                        const formValues = values as {
                          file: File | undefined;
                          slug: string;
                        };
                        const fileValue = formValues.file;
                        const slugValue = formValues.slug;

                        const isFormValid =
                          canSubmit &&
                          fileValue !== null &&
                          fileValue !== undefined &&
                          slugValue.trim() !== "";

                        return (
                          <button
                            type="submit"
                            disabled={!isFormValid || mutation.isPending}
                            className="cursor-pointer w-12 h-full flex items-center justify-center bg-[#C43E1C] text-white hover:bg-[#FF8C69] transition-colors disabled:opacity-30 disabled:bg-black"
                          >
                            {mutation.isPending ? (
                              <LoaderCircle className="h-[50%] animate-spin" />
                            ) : (
                              <ChevronRight className="h-[50%]" />
                            )}
                          </button>
                        );
                      }}
                    />
                  }
                />
              )}
            />
          </form>
          <legend className="ds-legend text-gray-700">
            Esse é o nome que irá aparecer no seu link
          </legend>
        </div>
      </div>
    </div>
  );
}
