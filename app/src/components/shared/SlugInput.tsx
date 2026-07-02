import { useState } from "react";

interface SlugInputProps {
  placeholder?: string;
}

function normalizeSlug(slug: string): string {
  return slug.replaceAll(" ", "-");
}

export default function SlugInput(props: SlugInputProps) {
  const [slug, setSlug] = useState<string>("");

  return (
    <div className="w-full flex items-center justify-center border-2 px-4 py-2">
      <label htmlFor="slug">dontoffice.com/ppt/</label>
      <input
        onChange={(event) => {
          event.preventDefault();
          setSlug(normalizeSlug(event.target.value));
        }}
        id="slug"
        value={slug ?? ""}
        className="w-full h-full outline-none placeholder:text-gray-300"
        placeholder={props.placeholder}
      />
    </div>
  );
}
