import { describe, expect, it } from "vitest";
import { computePeaks } from "./decode";
import { checkDuration, checkFile, contentTypeFor, defaultWindow, MAX_UPLOAD_BYTES } from "./file";

const file = (name: string, size = 1000) => {
  const blob = new File([new Uint8Array(1)], name);
  Object.defineProperty(blob, "size", { value: size });
  return blob;
};

describe("file checks", () => {
  it("derives the content type from the extension", () => {
    expect(contentTypeFor(file("riff.WAV"))).toBe("audio/wav");
    expect(contentTypeFor(file("solo.m4a"))).toBe("audio/mp4");
    expect(contentTypeFor(file("notes.txt"))).toBeNull();
  });

  it("rejects unsupported and oversized files before uploading", () => {
    expect(checkFile(file("cover.png"))).toBe("unsupported_format");
    expect(checkFile(file("take.flac", MAX_UPLOAD_BYTES + 1))).toBe("file_too_large");
    expect(checkFile(file("take.flac"))).toBeNull();
  });

  it("enforces the 5 s – 10 min duration range", () => {
    expect(checkDuration(4.9)).toBe("audio_too_short");
    expect(checkDuration(601)).toBe("audio_too_long");
    expect(checkDuration(180)).toBeNull();
  });

  it("proposes a default window of at most 30 s inside the file", () => {
    expect(defaultWindow(12)).toEqual({ start: 0, end: 12 });
    expect(defaultWindow(200)).toEqual({ start: 15, end: 45 });
  });
});

describe("peaks", () => {
  it("normalises bucket peaks across channels", () => {
    const left = new Float32Array([0, 0.2, 0, 0.1]);
    const right = new Float32Array([0, 0, 0.4, 0]);
    const peaks = computePeaks({ numberOfChannels: 2, length: 4, getChannelData: (index) => (index === 0 ? left : right) }, 2);
    expect(peaks).toEqual([0.5, 1]);
  });
});
