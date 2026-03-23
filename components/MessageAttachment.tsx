export const MessageAttachment = ({
  url,
  name,
  mediaType,
}: {
  url: string;
  name?: string;
  mediaType?: string;
}) => {
  if (!mediaType) {
    return (
      <a href={url} target="_blank" className="text-blue-500 underline">
        {name || "Open file"}
      </a>
    );
  }

  // 🎧 AUDIO
  if (mediaType.startsWith("audio")) {
    return (
      <audio controls className="max-w-xs rounded">
        <source src={url} type={mediaType} />
      </audio>
    );
  }

  // 🖼 IMAGE
  if (mediaType.startsWith("image")) {
    return (
      <img
        src={url}
        alt={name}
        className="max-w-xs rounded-lg border"
      />
    );
  }

  // 🎥 VIDEO
  if (mediaType.startsWith("video")) {
    return (
      <video controls className="max-w-xs rounded">
        <source src={url} type={mediaType} />
      </video>
    );
  }

  // 📄 DEFAULT FILE
  return (
    <a
      href={url}
      target="_blank"
      className="text-blue-500 underline text-sm"
    >
      {name || "Open file"}
    </a>
  );
};