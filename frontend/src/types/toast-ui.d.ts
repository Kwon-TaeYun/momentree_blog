declare module "@toast-ui/react-editor" {
  import { ComponentType, RefObject } from "react";

  export interface EditorProps {
    initialValue?: string;
    previewStyle?: "tab" | "vertical";
    height?: string;
    initialEditType?: "markdown" | "wysiwyg";
    useCommandShortcut?: boolean;
    usageStatistics?: boolean;
    onChange?: () => void;
    onLoad?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    toolbarItems?: string[][];
    hooks?: {
      addImageBlobHook?: (
        blob: File,
        callback: (url: string, alt: string) => void
      ) => boolean;
    };
    language?: string;
    placeholder?: string;
    ref?: RefObject<EditorInstance | null>;
    autofocus?: boolean;
    hideModeSwitch?: boolean;
    theme?: string;
  }

  export interface ViewerProps {
    initialValue?: string;
    height?: string;
    referenceCallback?: (el: HTMLElement | undefined) => void;
    theme?: string;
    language?: string;
    usageStatistics?: boolean;
    onLoad?: () => void;
    ref?: RefObject<ViewerInstance | null>;
  }

  export interface ViewerInstance {
    getInstance: () => {
      setMarkdown: (markdown: string) => void;
      getMarkdown: () => string;
      getRootElement: () => HTMLElement;
    };
  }

  export interface EditorInstance {
    getInstance: () => {
      setMarkdown: (markdown: string) => void;
      getMarkdown: () => string;
      getHTML: () => string;
      insertText: (text: string) => void;
      insertImage: ({ src, alt }: { src: string; alt: string }) => void;
      focus: () => void;
      blur: () => void;
      getRootElement: () => HTMLElement;
      setHeight: (height: string) => void;
      replaceSelection: (text: string) => void;
      getSelection: () => { start: number; end: number } | null;
    };
  }

  export const Editor: ComponentType<EditorProps>;
  export const Viewer: ComponentType<ViewerProps>;
}
