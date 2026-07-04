import { useForm } from "@tanstack/react-form";
import DefaultDontofficeLogo from "../../components/shared/DefaultDontofficeLogo";
import DragAndDropFileUploadInput from "../../components/shared/DragAndDropFileUploadInput";
import SlugInput from "../../components/shared/SlugInput";
import { ChevronRight } from "lucide-react";

function createPPTRoute(file: File, slug: string) {}

export function PPTCreatePage() {
  const createForm = useForm({
    onSubmit: ({ value }) => {
      console.log(value);
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
                      const file = files.length > 0 ? files[0] : null;

                      field.handleChange(file);
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
            <SlugInput
              placeholder="apresentacao-rapida"
              trailing={
                <createForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isDirty]}
                  children={([canSubmit, isDirty]) => (
                    <button
                      disabled={!canSubmit || !isDirty}
                      className="cursor-pointer w-12 h-full flex items-center justify-center bg-[#C43E1C] text-white hover:bg-[#FF8C69] transition-colors disabled:opacity-30 disabled:bg-black"
                    >
                      <ChevronRight className="h-[50%]" />
                    </button>
                  )}
                />
              }
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
