"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import { artifactDefinitions } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import type { UIArtifact } from "./artifact";
export function DataStreamHandler() {
  const { dataStream, setDataStream } = useDataStream();
  const { mutate } = useSWRConfig();

  const { artifact, setArtifact, setMetadata } = useArtifact();

  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      // Handle chat title updates
      if (delta.type === "data-chat-title") {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        continue;
      }
      const artifactDefinition = artifactDefinitions.find(
        (currentArtifactDefinition) =>
          currentArtifactDefinition.kind === artifact.kind
      );

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

     setArtifact((draftArtifact) => {
  const baseArtifact: UIArtifact =
    draftArtifact ?? { ...initialArtifactData, status: "streaming" };

  switch (delta.type) {
    case "data-id":
      return {
        ...baseArtifact,
        documentId: delta.data,
        status: "streaming",
      } as UIArtifact;

    case "data-title":
      return {
        ...baseArtifact,
        title: delta.data,
        status: "streaming",
      } as UIArtifact;

    case "data-kind":
      return {
        ...baseArtifact,
        kind: delta.data,
        status: "streaming",
      } as UIArtifact;

    case "data-clear":
      return {
        ...baseArtifact,
        content: "",
        status: "streaming",
      } as UIArtifact;

    case "data-finish":
      return {
        ...baseArtifact,
        status: "idle",
      } as UIArtifact;

    default:
      return baseArtifact;
  }
});
    }
  }, [dataStream, setArtifact, setMetadata, artifact, setDataStream, mutate]);

  return null;
}
