import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { getWeather } from "./ai/tools/get-weather";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});



export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type CarouselItem = {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  price?: string;
  rating?: number;
  action?: {
    label: string;
    value: string;
  };
};


type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  text: string; // normal assistant/user text
  listing: { style: "type1" | "type2"; items?: CarouselItem[] }; // our listing carousel
  cart: null; // cart UI
  checkout: null; // checkout UI
  contents: {
  items: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    url?: string;
  }[];
};

  /* FORM (NEW) */
  form: {
    id?: string;
    title?: string;
    fields?: {
      name: string;
      label: string;
      type: "text" | "email" | "textarea" | "select";
      required?: boolean;
      options?: string[];
    }[];
  };
  buttons?: { label: string; value: string }[]; // buttons
  appendMessage?: string;
  image?: { url: string; alt?: string };
  suggestion?: Suggestion;
  sheetDelta?: string;
  codeDelta?: string;
  imageDelta?: string;
  textDelta?: string;
  id?: string;
  title?: string;
  kind?: ArtifactKind;
  clear?: null;
  finish?: null;
  "chat-title"?: string;
  carousel?: { items: CarouselItem[] };
};


export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
