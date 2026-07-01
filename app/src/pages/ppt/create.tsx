import DefaultDontofficeLogo from "../../components/shared/DefaultDontofficeLogo";

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
        <span className="ds-subtitle">Sua próxima apresentação, simples assim.</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        
      </div>
    </div>
  );
}
