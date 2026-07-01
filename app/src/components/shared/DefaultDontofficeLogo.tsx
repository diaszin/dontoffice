interface DefaultDontofficeLogo {
  name: string;
  initialGradientColor: string;
  finalGradientColor: string;
  className?: string;
}

export default function DefaultDontofficeLogo(props: DefaultDontofficeLogo) {
  return (
    <div className={props.className}>
      <span className="font-black tracking-tighter text-black ">Dont</span>
      <span
        className="font-black tracking-tighter bg-clip-text text-transparent ml-4"
        style={{
          // Aplica gradiente no texto (evita problema de renderização do gradiente no Safari e build)
          backgroundImage: `linear-gradient(90deg, ${props.initialGradientColor}, ${props.finalGradientColor})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {props.name}
      </span>
    </div>
  );
}
