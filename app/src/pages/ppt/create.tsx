import DefaultDontofficeLogo from "../../components/shared/DefaultDontofficeLogo";
import DragAndDropFileUploadInput from "../../components/shared/DragAndDropFileUploadInput";
import SlugInput from "../../components/shared/SlugInput";

export function PPTCreatePage() {
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
          <DragAndDropFileUploadInput/>
          <SlugInput placeholder="apresentacao-rapida" />
          <legend className="ds-legend text-gray-700">Esse é o nome que irá aparecer no seu link</legend>
        </div>
      </div>
    </div>
  );
}
