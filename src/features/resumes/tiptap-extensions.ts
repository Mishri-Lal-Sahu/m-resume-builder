import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";
import TiptapTableCell from "@tiptap/extension-table-cell";
import TiptapTableHeader from "@tiptap/extension-table-header";

export type FontSizeOptions = {
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

// --- Advanced Table Extensions ---

export const CustomTableCell = TiptapTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: { default: null, parseHTML: (e) => e.style.backgroundColor || null, renderHTML: (a) => (a.backgroundColor ? { style: `background-color: ${a.backgroundColor}` } : {}) },
      borderColor: { default: null, parseHTML: (e) => e.style.borderColor || null, renderHTML: (a) => (a.borderColor ? { style: `border-color: ${a.borderColor}` } : {}) },
      borderWidth: { default: null, parseHTML: (e) => e.style.borderWidth || null, renderHTML: (a) => (a.borderWidth ? { style: `border-width: ${a.borderWidth}` } : {}) },
      verticalAlign: { default: 'top', parseHTML: (e) => e.style.verticalAlign || 'top', renderHTML: (a) => (a.verticalAlign ? { style: `vertical-align: ${a.verticalAlign}` } : {}) },
    };
  },
});

export const CustomTableHeader = TiptapTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: { default: null, parseHTML: (e) => e.style.backgroundColor || null, renderHTML: (a) => (a.backgroundColor ? { style: `background-color: ${a.backgroundColor}` } : {}) },
      borderColor: { default: null, parseHTML: (e) => e.style.borderColor || null, renderHTML: (a) => (a.borderColor ? { style: `border-color: ${a.borderColor}` } : {}) },
      borderWidth: { default: null, parseHTML: (e) => e.style.borderWidth || null, renderHTML: (a) => (a.borderWidth ? { style: `border-width: ${a.borderWidth}` } : {}) },
      verticalAlign: { default: 'top', parseHTML: (e) => e.style.verticalAlign || 'top', renderHTML: (a) => (a.verticalAlign ? { style: `vertical-align: ${a.verticalAlign}` } : {}) },
    };
  },
});
