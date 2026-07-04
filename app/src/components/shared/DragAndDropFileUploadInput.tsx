import { useState, type DragEvent } from "react";
import { twMerge } from "tailwind-merge";

type DragAndDropFileUploadInputProps =
  React.InputHTMLAttributes<HTMLInputElement>;


export default function DragAndDropFileUploadInput(
  props: DragAndDropFileUploadInputProps,
) {
  const [dragging, setDragging] = useState(false);
  const className = twMerge([
    `w-full h-40 border border-dotted border-gray-400 rounded-lg flex flex-col items-center justify-center gap-2 transition ${
      dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
    }`,
    props.className,
  ]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (props.onDrop) {
          props.onDrop(e as DragEvent<HTMLInputElement>);
        }
        setDragging(false);
        
      }}
      className={className}
    >
      <div className="place-items-center">
        <p>Arraste e solte seu arquivo aqui</p>
        <p>ou</p>
      </div>

      {/* O label age como um botão para upload do arquivo */}
      <label
        htmlFor={props.name}
        className="cursor-pointer bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Selecionar arquivo
        <input
          {...props}
          name={props.name}
          id={props.id}
          type="file"
          className="hidden"
          accept=".ppt,.pps,.pptx,.ppsx"
        />
      </label>
    </div>
  );
}
