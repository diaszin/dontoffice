interface DefaultDontofficeLogo {
  name: string;
  initialGradientColor: string;
  finalGradientColor: string;
  className?: string
}

export default function DefaultDontofficeLogo(props: DefaultDontofficeLogo) {
  const gradientClassName = `
      font-black
      tracking-tighter
      bg-[linear-gradient(90deg,${props.initialGradientColor}_0%,${props.finalGradientColor}_100%)]
      bg-clip-text
      text-transparent
      
    `;
  return (
    <div className={props.className}>
      <span
        className="font-black tracking-tighter text-black "
        style={{
          fontFamily: '"Hanken Grotesk", sans-serif',
        }}
      >
        Dont
      </span>
      <span
        className={gradientClassName}
        style={{
          fontFamily: '"Hanken Grotesk", sans-serif',
        }}
      >
        {props.name}
      </span>
    </div>
  );
}
