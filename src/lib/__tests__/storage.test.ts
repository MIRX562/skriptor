import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadAudio, getPresignedUrl, getUploadUrl, deleteAudio, s3 } from "../storage";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

describe("Storage Client Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploadAudio sends a PutObjectCommand to the client", async () => {
    const buffer = Buffer.from("test");
    const key = "test-key.mp3";
    const contentType = "audio/mpeg";

    await uploadAudio(buffer, key, contentType);

    expect(s3.send).toHaveBeenCalledTimes(1);
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
  });

  it("getPresignedUrl creates a GetObjectCommand and calls getSignedUrl", async () => {
    const key = "test-key.mp3";
    
    const url = await getPresignedUrl(key, 3600);

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
        Key: key,
      })
    );
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(url).toBe("https://s3.example.com/test-bucket/presigned-url");
  });

  it("getUploadUrl creates a PutObjectCommand and calls getSignedUrl", async () => {
    const key = "test-key.mp3";
    const contentType = "audio/mpeg";

    const url = await getUploadUrl(key, contentType, 3600);

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
        Key: key,
        ContentType: contentType,
      })
    );
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(url).toBe("https://s3.example.com/test-bucket/presigned-url");
  });

  it("deleteAudio sends a DeleteObjectCommand to the client", async () => {
    const key = "test-key.mp3";

    await deleteAudio(key);

    expect(s3.send).toHaveBeenCalledTimes(1);
    expect(DeleteObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
        Key: key,
      })
    );
  });
});
