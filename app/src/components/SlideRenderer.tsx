import React, {
  useState,
  useEffect,
  type ButtonHTMLAttributes,
  useRef,
} from "react";
import {
  parsePPTX,
  type PresentationData,
  type SlideElement,
} from "../utils/pptxParser";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Presentation,
} from "lucide-react";

interface SlideRendererProps {
  arrayBuffer: ArrayBuffer | null;
  onClose?: () => void;
  closeTitle?: string;
  downloadURL?: string;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  arrayBuffer,
  onClose,
  closeTitle,
  downloadURL,
}) => {
  const [presentation, setPresentation] = useState<PresentationData | null>(
    null,
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arrayBuffer) return;

    const loadSlides = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedData = await parsePPTX(arrayBuffer);
        setPresentation(parsedData);
        setCurrentSlideIndex(0);
      } catch (err) {
        console.error("Error parsing PPTX", err);
        setError("Não foi possível carregar a apresentação.");
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, [arrayBuffer]);

  if (!arrayBuffer) {
    return (
      <div className="flex h-full min-h-100 w-full items-center justify-center rounded-xl border border-dashed border-gray-600 bg-gray-900/50 backdrop-blur-md">
        <p className="text-gray-400">Nenhum arquivo carregado</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-100 w-full flex-col items-center justify-center space-y-4 rounded-xl border border-gray-700 bg-gray-100 p-8 shadow-2xl backdrop-blur-lg">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <p className="animate-pulse text-lg font-medium text-gray-500">
          Processando Apresentação...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-100 w-full flex-col items-center justify-center rounded-xl border border-red-500 bg-white p-8 text-red-400 backdrop-blur-lg">
        <p>{error}</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-lg bg-red-900/50 px-4 py-2 transition-colors hover:bg-red-800/50"
        >
          {closeTitle || "Voltar para a página principal"}
        </button>
      </div>
    );
  }

  if (!presentation) return null;

  const currentSlide = presentation.slides[currentSlideIndex];
  const { w: baseW, h: baseH } = presentation.size;
  const aspectRatio = `${baseW} / ${baseH}`;

  const movePrev = () => setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  const moveNext = () =>
    setCurrentSlideIndex((prev) =>
      Math.min(presentation.slides.length - 1, prev + 1),
    );

  return (
    <div className="relative flex h-full w-full  flex-col gap-4 items-center justify-center overflow-hidden rounded-2xl  from-gray-950 to-gray-900 p-6 shadow-2xl ring-1 ring-white/10">
      {/* Header Controls */}
      <div className="flex flex-row w-full max-w-5xl items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <span className="rounded-full border bg-white px-3 py-1 font-ds-subtitle backdrop-blur-md">
            Slide {currentSlideIndex + 1} / {presentation.slides.length}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <a
            href={downloadURL}
            download
            className="cursor-pointer group rounded-full p-2 transition-all hover:bg-gray-900  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownToLine className="size-[--icon-size] group-hover:text-white" />
          </a>
          <button
            onClick={() => {
              slideElementRef.current?.requestFullscreen();
              slideElementRef.current?.focus();
            }}
            className="cursor-pointer group rounded-full p-2 transition-all hover:bg-gray-900  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Presentation className="size-[--icon-size] group-hover:text-white" />
          </button>
        </div>
      </div>
      {/* Slide Container */}
      <div
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            movePrev();
          } else if (event.key === "ArrowRight") {
            moveNext();
          }
        }}
        tabIndex={0} // Para capturar os eventos do teclado em tela cheia
        ref={slideElementRef}
        className="[&:fullscreen]:cursor-none relative w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out"
        style={{ aspectRatio, containerType: "size" }}
      >
        {currentSlide ? (
          <div className="absolute inset-0 h-full w-full">
            {currentSlide.backgroundUrl && (
              <img
                src={currentSlide.backgroundUrl}
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover z-0"
              />
            )}
            <div className="absolute inset-0 z-10 h-full w-full">
              {currentSlide.elements.map((element) => (
                <RenderElement
                  key={element.id}
                  element={element}
                  baseW={baseW}
                  baseH={baseH}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            Slide Vazio
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="bottom-6 flex items-center space-x-6 rounded-full bg-gray-300 px-6 py-3 shadow-xl backdrop-blur-md ring-1 ring-white/10">
        <RoundIconButton onClick={movePrev} disabled={currentSlideIndex === 0}>
          <ChevronLeft className="h-6 w-6 text-gray-100 group-hover:text-white" />
        </RoundIconButton>

        <div className="flex space-x-1.5 max-w-[40vw] overflow-x-auto p-1">
          {presentation.slides.map((_, idx) => (
            <ItemBulletPoint
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              isSelected={idx === currentSlideIndex}
            />
          ))}
        </div>

        <RoundIconButton
          onClick={moveNext}
          disabled={currentSlideIndex === presentation.slides.length - 1}
        >
          <ChevronRight className="h-6 w-6 text-gray-100 group-hover:text-white" />
        </RoundIconButton>
      </div>
    </div>
  );
};

const RenderElement = ({
  element,
  baseW,
  baseH,
}: {
  element: SlideElement;
  baseW: number;
  baseH: number;
}) => {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(element.x / baseW) * 100}%`,
    top: `${(element.y / baseH) * 100}%`,
    width: `${(element.w / baseW) * 100}%`,
    height: `${(element.h / baseH) * 100}%`,
  };

  // Common SVG Layer (Vector shapes, Borders, and Vector Masks over Bitmaps)
  const svgBackground =
    element.svgPaths && element.svgPaths.length > 0 ? (
      <div className="absolute inset-0 h-full w-full z-0 pointer-events-none">
        {element.svgPaths.map((path, idx) => {
          const patternId = `pattern-${element.id}-${idx}`;
          let imgX = 0;
          let imgY = 0;
          let imgW = path.w;
          let imgH = path.h;
          if (element.crop) {
            const { l, t, r, b } = element.crop;
            const origW = 1 / (1 - l - r);
            const origH = 1 / (1 - t - b);
            imgX = -l * origW * path.w;
            imgY = -t * origH * path.h;
            imgW = origW * path.w;
            imgH = origH * path.h;
          }

          return (
            <svg
              key={idx}
              viewBox={`0 0 ${path.w} ${path.h}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              style={{ overflow: "visible" }}
            >
              {element.url && (
                <defs>
                  <pattern
                    id={patternId}
                    patternUnits="userSpaceOnUse"
                    width={path.w}
                    height={path.h}
                  >
                    <image
                      href={element.url}
                      x={imgX}
                      y={imgY}
                      width={imgW}
                      height={imgH}
                      preserveAspectRatio="none"
                    />
                  </pattern>
                </defs>
              )}
              <path
                d={path.d}
                fill={
                  element.url
                    ? `url(#${patternId})`
                    : element.color !== "transparent"
                      ? element.color
                      : "none"
                }
                stroke={element.stroke?.color || "none"}
                strokeWidth={
                  element.stroke?.width ? element.stroke.width / 9525 : 0
                }
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
        })}
      </div>
    ) : null;

  // Render Background Image (if no SVG mask exists)
  let cssBackgroundImage = null;
  if (!element.svgPaths && element.url) {
    if (element.crop) {
      const { l, t, r, b } = element.crop;
      const origW = 1 / (1 - l - r);
      const origH = 1 / (1 - t - b);
      cssBackgroundImage = (
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0">
          <img
            src={element.url}
            alt="Cropped Graphic"
            style={{
              position: "absolute",
              left: `-${l * origW * 100}%`,
              top: `-${t * origH * 100}%`,
              width: `${origW * 100}%`,
              height: `${origH * 100}%`,
              maxWidth: "none",
            }}
          />
        </div>
      );
    } else {
      cssBackgroundImage = (
        <img
          src={element.url}
          alt="Slide Graphic"
          className="absolute inset-0 h-full w-full object-fill pointer-events-none z-0"
        />
      );
    }
  }

  if (element.type === "text") {
    const fontSizePts = element.fontSize || 18;
    const fontSizeEMU = fontSizePts * 12700;
    const fontSizeCQH = (fontSizeEMU / baseH) * 100;

    return (
      <div
        style={{
          ...style,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          backgroundColor:
            !element.svgPaths && element.color !== "transparent"
              ? element.color
              : "transparent",
        }}
      >
        {svgBackground}
        {cssBackgroundImage}
        <span
          style={{
            fontSize: `${fontSizeCQH}cqh`,
            textAlign: (element.align as CanvasTextAlign) || "left",
            whiteSpace: "pre-wrap",
            lineHeight: 1.2,
            wordBreak: "break-word",
            zIndex: 10,
            position: "relative",
          }}
          className="text-gray-800"
        >
          {element.content}
        </span>
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <div style={style}>
        {svgBackground}
        {cssBackgroundImage}
      </div>
    );
  }

  if (element.type === "shape") {
    return (
      <div
        style={{
          ...style,
          backgroundColor:
            !element.svgPaths && element.color !== "transparent"
              ? element.color
              : "transparent",
        }}
      >
        {svgBackground}
        {cssBackgroundImage}
      </div>
    );
  }

  return null;
};

const RoundIconButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className="cursor-pointer group rounded-full bg-gray-700 p-2 transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {props.children}
    </button>
  );
};

const ItemBulletPoint = ({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`h-2 shrink-0 rounded-full transition-all duration-300 ${
        isSelected
          ? "w-6 bg-[#C43E1C]"
          : "w-2 bg-gray-600 hover:bg-gray-400 cursor-pointer"
      }`}
    />
  );
};
