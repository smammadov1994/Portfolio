import React, { useEffect, useMemo, useState } from "react";
import "./GalleryView.css";
import { fetchCloudflareGalleryImages } from "../services/cloudflareGallery";

// Placeholder colors until real images are added
const PLACEHOLDER_COLORS = [
  "#3a3d5c",
  "#4a4d7c",
  "#5a5d8c",
  "#6a6d9c",
  "#2a2d4c",
  "#3a4d6c",
  "#4a5d7c",
  "#5a6d8c",
  "#2a3d5c",
  "#3a4d7c",
  "#4a5d9c",
  "#5a6dac",
  "#3a2d4c",
  "#4a3d6c",
  "#5a4d8c",
  "#6a5d9c",
];

const GalleryView = ({ images = [] }) => {
  const [remoteImages, setRemoteImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState(null); // { src, alt }

  // If no images are passed in via artifact data, auto-fetch from Cloudflare (R2/Images/Worker).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (images.length > 0) return;

      setIsLoading(true);
      setLoadError("");
      try {
        const urls = await fetchCloudflareGalleryImages();
        if (!cancelled) setRemoteImages(urls);
      } catch (e) {
        // Keep placeholders on error; just log for debugging.
        console.error("Gallery: failed to load Cloudflare images", e);
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : "Failed to load gallery images";
          setLoadError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [images.length]);

  const effectiveImages = images.length > 0 ? images : remoteImages;

  const items = useMemo(() => {
    if (effectiveImages.length > 0) {
      return effectiveImages
        .map((item, i) => {
          // Support either {src, alt} objects or plain URL strings.
          const src = typeof item === "string" ? item : item?.src;
          const alt =
            typeof item === "string"
              ? "Gallery image"
              : item?.alt || "Gallery image";
          return { id: src || i, type: "image", src, alt };
        })
        .filter((i) => Boolean(i.src));
    }

    // Use placeholder colored squares while loading (or if no remote images found).
    return PLACEHOLDER_COLORS.map((color, i) => ({
      id: i,
      type: "placeholder",
      color,
      height: Math.floor(Math.random() * 150) + 200, // Random heights for masonry
    }));
  }, [effectiveImages]);

  const closeLightbox = () => setActiveImage(null);

  // Close on Escape + lock background scroll while lightbox is open
  useEffect(() => {
    if (!activeImage) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

  return (
    <div className="gallery-view">
      {isLoading && images.length === 0 ? (
        <div className="gallery-loading">Loading images…</div>
      ) : null}
      {!isLoading &&
      images.length === 0 &&
      remoteImages.length === 0 &&
      loadError ? (
        <div className="gallery-loading">Couldn’t load images: {loadError}</div>
      ) : null}

      <div className="masonry-grid">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className={`masonry-item ${
              item.type === "placeholder"
                ? "masonry-item--placeholder"
                : "masonry-item--image"
            }`}
            role={item.type === "image" ? "button" : undefined}
            tabIndex={item.type === "image" ? 0 : undefined}
            aria-label={item.type === "image" ? "Open image" : undefined}
            onClick={() => {
              if (item.type === "image") {
                setActiveImage({
                  src: item.src,
                  alt: item.alt || "Gallery image",
                });
              }
            }}
            onKeyDown={(e) => {
              if (item.type !== "image") return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveImage({
                  src: item.src,
                  alt: item.alt || "Gallery image",
                });
              }
            }}
            style={{
              height: item.type === "placeholder" ? item.height || 250 : "auto",
            }}
          >
            {item.type === "placeholder" ? (
              <div className="placeholder-content">
                <div className="gallery-spinner" aria-label="Loading" />
              </div>
            ) : (
              <img
                src={item.src}
                alt={item.alt || "Gallery image"}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {activeImage ? (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button
            className="gallery-lightbox-close"
            type="button"
            aria-label="Close image"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            ×
          </button>

          <div
            className="gallery-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="gallery-lightbox-img"
              src={activeImage.src}
              alt={activeImage.alt}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GalleryView;
