import { useState, type InputHTMLAttributes } from "react";

interface SlugInputProps extends InputHTMLAttributes<HTMLInputElement> {
  trailing?: React.ReactNode;
}

function normalizeSlug(slug: string): string {
  return slug.replaceAll(" ", "-");
}

export default function SlugInput(props: SlugInputProps) {
  const [slug, setSlug] = useState<string>("");

  return (
    <div className="w-full h-12 flex border-2">
      <div className="w-full flex items-center px-4 py-2">
        <label htmlFor={props.id}>dontoffice.com/ppt/</label>
        <input
          onChange={(event) => {
            event.preventDefault();
            setSlug(normalizeSlug(event.target.value));
            if (props.onChange) {
              props.onChange(event);
            }
          }}
          id={props.id}
          name={props.name}
          value={slug ?? ""}
          className="w-full outline-none placeholder:text-gray-300"
          placeholder={props.placeholder}
        />
      </div>
      {props.trailing && props.trailing}
    </div>
  );
}
