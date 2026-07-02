import { useState } from "react";

function dropFile(
  event: React.DragEvent<HTMLDivElement>,
  setDragging: (dragging: boolean) => void,
) {
  event.preventDefault();
  setDragging(false);

  const files = event.dataTransfer.files;

  if (files.length > 0) {
    console.log(files[0]);
  }
}

export default function DragAndDropFileUploadInput() {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        dropFile(e, setDragging);
      }}
      className={`w-full h-40 border border-dotted border-gray-400 rounded-lg flex flex-col items-center justify-center gap-2 transition ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <div className="place-items-center">
        <p>Arraste e solte seu arquivo aqui</p>
        <p>ou</p>
      </div>
      <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
        Selecionar arquivo
        <input type="file" className="hidden" accept=".ppt,.pps,.pptx,.ppsx" />
      </label>
    </div>
  );
}
